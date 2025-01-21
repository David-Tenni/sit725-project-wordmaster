$(document).ready(function () {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
      $('#settings-menu').hide();
    }

    //select dropdown
    $('select').formSelect();

    let socket;

    function updateTableHeader(headers) {
      const headerRow = headers.map(header => `<th>${header}</th>`).join('');
      $('#table-header').html(headerRow);
    }

    function updateTableBody(data, keys) {
      //clear the table when changing filters
      $('#leaderboard-body').empty();

      //filter out rows where values are zero, empty, or null
      const filteredData = data.filter(item => {
        const valueKey = keys[1];  
        const value = item[valueKey];
          return value !== undefined && value !== null && value !== 0 && value !== '';
        });

      const rows = filteredData.map(item => {
        const row = keys.map(key => `<td>${item[key]}</td>`).join('');
        return `<tr>${row}</tr>`;
      }).join('');
      $('#leaderboard-body').html(rows);
    }

    function connectSocket(filter) {
      if (socket) {
        socket.disconnect();
      }

      //clear the table body and header when switching filters
      $('#leaderboard-body').empty();
      $('#table-header').empty();

      switch (filter) {
        case 'highScore':
          socket = io('/high_score');
          updateTableHeader(['Name', 'High Score']);
          socket.on('Users_by_high_score', data => {
            updateTableBody(data, ['username', 'high_score']);
          });
          break;

        case 'totalScore':
          socket = io('/total_score');
          updateTableHeader(['Name', 'Total Score']);
          socket.on('Users_by_total_score', data => {
            updateTableBody(data, ['username', 'total_score']);
          });
          break;

        case 'wins':
          socket = io('/wins');
          updateTableHeader(['Name', 'Wins']);
          socket.on('Users_by_wins', data => {
            updateTableBody(data, ['username', 'wins']);
          });
          break;

        case 'wordLength':
          socket = io('/word_length');
          updateTableHeader(['Name', 'Longest Word']);
          socket.on('Users_by_word_length', data => {
            updateTableBody(data, ['username', 'longest_word']);
          });
          break;

        case 'categories':
          socket = io('/categories');
          updateTableHeader(['Category', 'Name', 'Word']);
          socket.on('Categories', data => {
            updateTableBody(data, ['category', 'username', 'word']);
          });
          break;

        default:
          console.error('Unknown filter:', filter);
      }
    }

    connectSocket($('#leaderboard-filter').val());

    //change socket connection on filter change
    $('#leaderboard-filter').on('change', function () {
      const selectedFilter = $(this).val();
      connectSocket(selectedFilter);
    });

    //update results per page
    $('#results-per-page').on('change', function () {
      const selectedResults = parseInt($(this).val());
      $('.scrollable-table').css('max-height', `${selectedResults * 40}px`);
    });
  });