(function(window) {
    class ProfileController {
        constructor() {
            this.initializeProfile();
        }

        async initializeProfile() {
            const username = localStorage.getItem('user');
            const accessToken = localStorage.getItem('accessToken');

            console.log('Auth check:', {
                hasUsername: !!username,
                hasToken: !!accessToken,
                username: username,
                tokenLength: accessToken ? accessToken.length : 0
            });

            // Check auth before doing anything else
            if (!username || !accessToken) {
                // console.log('Auth failed - redirecting to login');
                window.location.href = '/login.html';
                return;
            }

            // If we get here, we have the required auth items
            // console.log('Auth passed - continuing to load profile');

            $('#profile-username').text(username);
            this.fetchUserData(accessToken);
        }

        async fetchUserData(accessToken) {
            try {
                const response = await requestWithRefresh('/api/user', {
                    headers: {
                        'Authorization': accessToken
                    },
                })
                
                if(response.status === 200){
                    const data = await response.json();
                    this.updateUI(data.data);
                }else{
                    M.toast({html: `Error: ${'Unknown error'}`});
                }
            } catch {
                M.toast({html: `Error: ${'Unknown error'}`});
            }
        }

        updateUI(userData) {
            // Update stats
            $('#total-score').text(userData.total_score || 0);
            $('#high-score').text(userData.high_score || 0);
            $('#total-wins').text(userData.wins || 0);
            $('#games-played').text(userData.games || 0);

            // Display category achievements
            if (userData.answers) {
                const categoryList = $('#category-list');
                categoryList.empty(); // Clear existing items
                
                Object.entries(userData.answers).forEach(([category, data]) => {
                    categoryList.append(`
                        <div class="achievement-card">
                            <div class="category-name">${category.replace(/_/g, " ") }</div>
                            <div class="best-word">Best Word: ${data.word}</div>
                            <div class="response-time">Time: ${(data.time / 1000).toFixed(2)}s</div>
                        </div>
                    `);
                });
            }
        }
    }

    window.ProfileController = ProfileController;
})(window);