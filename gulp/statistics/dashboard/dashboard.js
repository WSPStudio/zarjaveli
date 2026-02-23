document.addEventListener("DOMContentLoaded", () => {
  const filesCanvas = document.getElementById("filesChart");
  const sessionsCanvas = document.getElementById("sessionsChart");

  if (!filesCanvas || !sessionsCanvas) {
    console.error("Не найден canvas для графика");
    return;
  }
  fetch("/__stats/data")
    .then((r) => r.json())
    .then((data) => {
      // === Файлы ===
      new Chart(filesCanvas, {
        type: "bar",
        data: {
          labels: Object.keys(data.files),
          datasets: [
            {
              label: "Изменения файлов",
              data: Object.values(data.files),
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 20,
                  weight: "bold",
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                font: {
                  size: 18,
                  weight: "bold",
                },
              },
            },
          },
        },
      });

      // === Сессии ===
      const sessionByDate = {};
      data.sessions.forEach((s) => {
        const date = s.date;
        const duration = s.end - s.start;
        sessionByDate[date] = (sessionByDate[date] || 0) + duration;
      });

      // Краткая запись без года
      const sessionByDateShort = Object.fromEntries(
        Object.entries(sessionByDate).map(([date, ms]) => {
          const [day, month] = date.split(".");
          return [`${day}.${month}`, ms];
        })
      );

      new Chart(sessionsCanvas, {
        type: "line",
        data: {
          labels: Object.keys(sessionByDateShort),
          datasets: [
            {
              label: "Время работы (мин)",
              data: Object.values(sessionByDate).map((ms) => ms / 60000),
              borderColor: "rgba(255, 99, 132, 0.8)",
              backgroundColor: "rgba(255, 99, 132, 0.3)",
              fill: true,
              tension: 0.3,
              pointRadius: 16,
              pointHoverRadius: 16,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              labels: {
                font: {
                  size: 20,
                  weight: "bold",
                },
              },
            },
            tooltip: {
              callbacks: {
                label(ctx) {
                  const minutes = ctx.parsed.y;
                  const h = Math.floor(minutes / 60);
                  const m = Math.round(minutes % 60);

                  if (h && m) return ` ${h} ч ${m} мин`;
                  if (h) return ` ${h} ч`;
                  return ` ${m} мин`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                font: {
                  size: 14,
                  weight: "bold",
                },
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 60,
                font: {
                  size: 18,
                  weight: "bold",
                },
                callback(value) {
                  if (value === 0) return "0";
                  return `${Math.floor(value / 60)} ч`;
                },
              },
            },
          },
        },
      });
    })
    .catch((err) => console.error("Ошибка при загрузке статистики:", err));
});
