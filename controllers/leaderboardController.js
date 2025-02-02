$(document).ready(function () {
  let currentSocket = null;  // Track current socket connection
  let previousData = null;   // Track previous data state

  // Initialize form selects
  $("select").formSelect();

  function updateTableHeader(headers) {
    $("#table-header").empty().html(
      headers.map((header) => `<th>${header}</th>`).join("")
    );
  }

  function clearTable() {
    $("#leaderboard-body").empty();
    previousData = null;
  }

  function updateTableBody(data, keys) {
    if (!data || data.length === 0) {
      return;
    }

    // Filter out invalid entries
    const filteredData = data.filter((item) => {
      return keys.every(key => item[key] !== undefined && item[key] !== null);
    });

    if (JSON.stringify(filteredData) === JSON.stringify(previousData)) {
      return; // No changes, skip update
    }

    $("#leaderboard-body").empty();
    const rows = filteredData.map((item) => {
      const cells = keys.map((key) => {
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
          return `<td class="value-cell">${item[key].replace(/_/g, " ")}</td>`;
        }
        return `<td class="value-cell">${item[key]}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    
    $("#leaderboard-body").html(rows);
    previousData = filteredData;
  }

  function disconnectCurrentSocket() {
    if (currentSocket) {
      currentSocket.off();  
      currentSocket.disconnect();
      currentSocket = null;
    }
  }

  function connectSocket(filter) {
    disconnectCurrentSocket();
    clearTable();

    // Set up new connection based on filter
    switch (filter) {
      case "highScore":
        currentSocket = io("/high_score");
        updateTableHeader(["Name", "High Score"]);
        currentSocket.on("Users_by_high_score", (data) => {
          updateTableBody(data, ["username", "high_score"]);
        });
        break;

      case "totalScore":
        currentSocket = io("/total_score");
        updateTableHeader(["Name", "Total Score"]);
        currentSocket.on("Users_by_total_score", (data) => {
          updateTableBody(data, ["username", "total_score"]);
        });
        break;

      case "wins":
        currentSocket = io("/wins");
        updateTableHeader(["Name", "Wins"]);
        currentSocket.on("Users_by_wins", (data) => {
          updateTableBody(data, ["username", "wins"]);
        });
        break;

      case "wordLength":
        currentSocket = io("/word_length");
        updateTableHeader(["Name", "Longest Answer"]);
        currentSocket.on("Users_by_word_length", (data) => {
          updateTableBody(data, ["username", "longest_word"]);
        });
        break;

      case "categories":
        currentSocket = io("/categories");
        updateTableHeader(["Category", "Name", "Answer"]);
        currentSocket.on("Categories", (data) => {
          updateTableBody(data, ["category", "username", "word"]);
        });
        break;

      default:
        console.error("Unknown filter:", filter);
        return;
    }

    // Add error handling for socket connection
    currentSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      M.toast({html: 'Connection error. Please try again.'});
    });

    currentSocket.on("disconnect", () => {
      // console.log("Socket disconnected");
    });
  }

  // Initial connection
  connectSocket($("#leaderboard-filter").val());

  // Handle filter changes
  $("#leaderboard-filter").on("change", function () {
    const selectedFilter = $(this).val();
    connectSocket(selectedFilter);
  });

  // Handle results per page changes
  $("#results-per-page").on("change", function () {
    const selectedResults = parseInt($(this).val());
    $(".scrollable-table").css("max-height", `${selectedResults * 40}px`);
  });

  // Clean up
  $(window).on("beforeunload", function() {
    disconnectCurrentSocket();
  });
});