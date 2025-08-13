let notificationSocket = io("/notification");

notificationSocket.on("connect", () => {
    let token = localStorage.getItem("accessToken");
    if (token) {
        notificationSocket.emit("authenticate", token);
    }
});

notificationSocket.on("alert", (message) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if(isLoggedIn){
        M.toast({html: message, classes: 'rounded red lighten-1', displayLength: 5000});
    }
});

notificationSocket.on("disconnect", () => {
    console.log("Disconnected");
});
