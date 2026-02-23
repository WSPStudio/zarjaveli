import gulp from "gulp";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import dotenv from "dotenv";

import { isWp } from "./settings.js";

const projectName = path.basename(path.resolve());
const DEFAULT_PORT = 8080;
const backupFile = "./docker/db/backup.sql";

export const wp = (done) => {
  if (projectName == "template") {
    console.log("\n\n ❌ В шаблоне template нельзя выполнять этот таск \n\n");
    return;
  }

  console.log(`🚀 Настройка проекта: ${projectName}`);

  const ymlPath = "./docker-compose.yml";
  const envPath = "./.env";

  if (!fs.existsSync(ymlPath) || !fs.existsSync(envPath)) {
    console.error("❌ docker-compose.yml или .env не найдены");
    done();
    return;
  }

  let dockerYml = fs.readFileSync(ymlPath, "utf8");

  dockerYml = dockerYml.replace(/container_name: wp_local(_\w+)?/, (match, p1) => {
    return `container_name: wp_local_${projectName}`;
  });

  dockerYml = dockerYml.replace(/container_name: wp_db_local(_\w+)?/, (match, p1) => {
    return `container_name: wp_db_local_${projectName}`;
  });

  dockerYml = dockerYml.replace(/db_data(_\w+)?:/g, (match, p1) => {
    return `db_data_${projectName}:`;
  });

  dockerYml = dockerYml.replace(/- "\d+:80"/, (match) => {
    return `- "${DEFAULT_PORT + 1}:80"`;
  });

  fs.writeFileSync(ymlPath, dockerYml);
  console.log(`✅ docker-compose.yml обновлён для проекта ${projectName}`);

  // --- .en ---
  let env = fs.readFileSync(envPath, "utf8");
  env = env.replace(/WORDPRESS_DB_NAME=wp_db(_\w+)?/, (match, p1) => {
    return `WORDPRESS_DB_NAME=wp_db_${projectName}`;
  });
  fs.writeFileSync(envPath, env);
  console.log(`✅ .env обновлён для проекта ${projectName}`);

  exec("docker-compose down", (err) => {
    if (err) throw err;
    exec("docker-compose up -d --build", (err2) => {
      if (err2) throw err2;
      console.log("✅ Docker запущен");

      const waitForMySQL = (cb) => {
        const check = () => {
          exec(`docker exec wp_db_local_${projectName} mysqladmin ping -h 127.0.0.1 -uroot -proot_pass`, (err3) => {
            if (!err3) return cb();
            setTimeout(check, 2000);
          });
        };
        check();
      };

      waitForMySQL(() => {
        console.log("✅ MySQL готов");

        const createDbCmd = `
          CREATE DATABASE IF NOT EXISTS wp_db_${projectName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
          GRANT ALL PRIVILEGES ON wp_db_${projectName}.* TO 'wp_user'@'%';
          FLUSH PRIVILEGES;
        `;
        exec(`docker exec -i wp_db_local_${projectName} mysql -h 127.0.0.1 -uroot -proot_pass -e "${createDbCmd}"`, (err4) => {
          if (err4) throw err4;
          console.log("✅ База создана и права выданы");

          if (fs.existsSync(backupFile)) {
            exec(`docker exec -i wp_db_local_${projectName} mysql -h 127.0.0.1 -uroot -proot_pass wp_db_${projectName} < ${backupFile}`, (err5) => {
              if (err5) throw err5;
              console.log("✅ backup.sql импортирован");
              updateWPUrls();
            });
          } else {
            updateWPUrls();
          }

          function updateWPUrls() {
            const sql = `
              UPDATE wp_options SET option_value='http://localhost:${DEFAULT_PORT + 1}' WHERE option_name='siteurl';
              UPDATE wp_options SET option_value='http://localhost:${DEFAULT_PORT + 1}' WHERE option_name='home';
            `;
            exec(`docker exec -i wp_db_local_${projectName} mysql -h 127.0.0.1 -uroot -proot_pass wp_db_${projectName} -e "${sql}"`, (err6) => {
              if (err6) throw err6;
              console.log("✅ siteurl и home обновлены");
              done();
            });
          }
        });
      });
    });
  });
};

const wpBackup = (done) => {
  const projectName = path.basename(path.resolve());
  const envPath = "./.env";

  if (!fs.existsSync(envPath)) {
    console.error("❌ .env не найден");
    done();
    return;
  }

  const env = dotenv.parse(fs.readFileSync(envPath));
  const dbUser = env.WORDPRESS_DB_USER;
  const dbName = env.WORDPRESS_DB_NAME;
  let container = `wp_db_local_${projectName}`;
  const backupPath = "./docker/db/backup.sql";

  container = projectName == "template" ? "wp_db_local" : container;

  console.log(`💾 Создание дампа базы ${dbName} из контейнера ${container}...`);

  const cmd = `docker exec ${container} sh -c 'exec mysqldump -u ${dbUser} -p"$MYSQL_PASSWORD" ${dbName}' > ${backupPath}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Ошибка при бэкапе:", err);
      done();
      return;
    }
    console.log(`✅ Бэкап сохранён в ${backupPath}`);
    done();
  });
};

const envFilePath = ".env";

function getEnvNodeEnv() {
  const env = fs.readFileSync(envFilePath, "utf-8");
  const match = env.match(/^NODE_ENV=(.*)$/m);
  return match ? match[1] : "dev";
}

function setEnvNodeEnv(value) {
  let env = fs.readFileSync(envFilePath, "utf-8");

  if (/^NODE_ENV=.*/m.test(env)) {
    env = env.replace(/^NODE_ENV=.*/m, `NODE_ENV=${value}`);
  } else {
    env += `\nNODE_ENV=${value}`;
  }

  fs.writeFileSync(envFilePath, env);
}

export function syncEnvAndDocker(cb) {
  if (!isWp) {
    cb();
    return;
  }
  const cliEnv = process.argv.includes("--build") ? "build" : "dev";
  const envFileEnv = getEnvNodeEnv();

  if (cliEnv !== envFileEnv) {
    console.log(`Docker ENV: ${envFileEnv} → ${cliEnv}`);
    setEnvNodeEnv(cliEnv);

    exec("docker compose down && docker compose up -d --build", (err, stdout, stderr) => {
      console.log(stdout);
      console.error(stderr);
      cb(err);
    });
  } else {
    cb();
  }
}

gulp.task("wp", wp);
gulp.task("backup", wpBackup);

export { wpBackup };
