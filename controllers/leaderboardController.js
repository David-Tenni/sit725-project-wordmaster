$(document).ready(function () {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  if (!isLoggedIn) {
    $("#settings-menu").hide();
  }

  //select dropdown
  $("select").formSelect();

  let socket;

  function updateTableHeader(headers) {
    const headerRow = headers.map((header) => `<th>${header}</th>`).join("");
    $("#table-header").html(headerRow);
  }

  let previousData = null;

  function updateTableBody(data, keys) {
    console.log("data:", data);
      // Check if data is actually changing
      if (!data || data.length === 0) {
          console.warn("No data received. Skipping update.");
          return;
      }
  
      // Filter out rows where values are zero, empty, or null
      const filteredData = data.filter((item) => {
          const valueKey = keys[1];
          const value = item[valueKey];
          return (
              value !== undefined && 
              value !== null && 
              value !== 0 && 
              value !== ""
          );
      });
  
      // If this is the first time, create the table structure
      if (!previousData) {
          $("#leaderboard-body").empty();
          const rows = filteredData
              .map((item) => {
                  const cells = keys
                      .map((key, index) => {
                          if (key === "username") {
                              return `
                                  <td>
                                      <div class="link-wrapper">
                                          <a href="/user/${item[key]}" class="username-link">
                                              <span class="link-content">${item[key]}</span>
                                          </a>
                                      </div>
                                  </td>`;
                          }
                          if (key === "category") {
                              return `<td class="value-cell" data-username="${item.username}" data-key="${key}">${item[key].replace(/_/g, " ")}</td>`;
                          }
                          return `<td class="value-cell" data-username="${item.username}" data-key="${key}">${item[key]}</td>`;
                      })
                      .join("");
                  return `<tr>${cells}</tr>`;
              })
              .join("");
          $("#leaderboard-body").html(rows);
      } else {
          // Only update changed values
          filteredData.forEach((item) => {
              keys.forEach((key) => {
                  if (key !== "username") {
                      const cell = $(`.value-cell[data-username="${item.username}"][data-key="${key}"]`);
                      const value = key === "category" ? item[key].replace(/_/g, " ") : item[key];
                      if (cell.text() !== String(value)) {
                          cell.text(value);
                      }
                  }
              });
          });
      }
  
      previousData = filteredData;
  }
  function connectSocket(filter) {
    if (socket) {
      socket.disconnect();
    }

    //clear the table body and header when switching filters
    $("#leaderboard-body").empty();
    $("#table-header").empty();

    switch (filter) {
      case "highScore":
        socket = io("/high_score");
        previousData = null;
        updateTableHeader(["Name", "High Score"]);
        socket.on("Users_by_high_score", (data) => {
          updateTableBody(data, ["username", "high_score"]);
        });
        break;

      case "totalScore":
        socket = io("/total_score");
        previousData = null;
        updateTableHeader(["Name", "Total Score"]);
        socket.on("Users_by_total_score", (data) => {
          updateTableBody(data, ["username", "total_score"]);
        });
        break;

      case "wins":
        socket = io("/wins");
        previousData = null;
        updateTableHeader(["Name", "Wins"]);
        socket.on("Users_by_wins", (data) => {
          updateTableBody(data, ["username", "wins"]);
        });
        break;

      case "wordLength":
        socket = io("/word_length");
        previousData = null;
        updateTableHeader(["Name", "Longest Word"]);
        socket.on("Users_by_word_length", (data) => {
          updateTableBody(data, ["username", "longest_word"]);
        });
        break;

      case "categories":
        socket = io("/categories");
        previousData = null;
        updateTableHeader(["Category", "Name", "Word"]);
        socket.on("Categories", (data) => {
          const updatedData = data.map((item) => ({
            ...item,
            category: item.category.replace(/_/g, " "),
          }));
          updateTableBody(updatedData, ["category", "username", "word"]);
        });
        break;

      default:
        console.error("Unknown filter:", filter);
    }
  }

  connectSocket($("#leaderboard-filter").val());

  //change socket connection on filter change
  $("#leaderboard-filter").on("change", function () {
    const selectedFilter = $(this).val();
    connectSocket(selectedFilter);
  });

  //update results per page
  $("#results-per-page").on("change", function () {
    const selectedResults = parseInt($(this).val());
    $(".scrollable-table").css("max-height", `${selectedResults * 40}px`);
  });
});
