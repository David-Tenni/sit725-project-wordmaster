(function(window) {
    class ProfileController {
        constructor() {
            console.log('ProfileController initializing...');
            this.initializeProfile();
        }

        async initializeProfile() {
            console.log('Page loading...');
            
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
                console.log('Auth failed - redirecting to login');
                window.location.href = '/login.html';
                return;
            }

            // If we get here, we have the required auth items
            console.log('Auth passed - continuing to load profile');

            $('#profile-username').text(username);
            this.fetchUserData(accessToken);
        }

        async fetchUserData(accessToken) {
            try {
                const response = await fetch('/api/user', {
                    headers: {
                        'Authorization': accessToken
                    },
                })
                if(response.status === 200){
                    const data = await response.json();

                    console.log('API response:', data);
                    if (!data.data) {
                        console.error('No data in response');
                        M.toast({html: 'Error: Invalid response format'});
                        return;
                    }
                    
                    this.updateUI(data.data);
                }else{
                    console.error('API Error:', {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        error: xhr.responseJSON
                    });

                    if (response.status === 401) {
                        console.log('Authentication failed - trying token refresh...');
                        this.tryRefreshToken();
                    } else if (response.status === 403) {
                        console.log('Access forbidden');
                        M.toast({html: 'Access denied'});
                    } else {
                        M.toast({html: `Error: ${xhr.responseJSON?.message || 'Unknown error'}`});
                    }
                }
            } catch {
                M.toast({html: `Error: ${xhr.responseJSON?.message || 'Unknown error'}`});
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

        async tryRefreshToken() {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                console.log('No refresh token - redirecting to login');
                window.location.href = '/login.html';
                return;
            }

            try {
                const response = await fetch('/api/user/refresh', {
                    method: 'POST',
                    headers: {
                        'Authorization': accessToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: refreshToken })
                });

                const data = await response.json();

                console.log('Token refreshed successfully');
                localStorage.setItem('accessToken', data.accessToken);
                window.location.reload();
            } catch (error) {
                console.log('Token refresh failed - redirecting to login');
                localStorage.clear();
                window.location.href = '/login.html';
            }
        }
    }

    window.ProfileController = ProfileController;
})(window);