(function(window) {
    window.requestWithRefresh = async function(url, requestData) {
        const response = await fetch(url, requestData);

        if(response.status != 401){
            return response;
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }

        try {
            const refreshResponse = await fetch('/api/user/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: refreshToken })
            });

            if(refreshResponse.status == 200){
                const data = await refreshResponse.json();

                localStorage.setItem('accessToken', data.accessToken);
                requestData.headers['Authorization'] = data.accessToken;

                const newResponse = await fetch(url, requestData);
                return newResponse;
            }else{
                localStorage.clear();
                window.location.href = '/login.html';
                return;
            }
            
        } catch (error) {
            localStorage.clear();
            window.location.href = '/login.html';
            return;
        }
    };
  })(window);