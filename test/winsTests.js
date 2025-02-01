const { Server } = require("socket.io");
const Client = require("socket.io-client");
const WinsSocket = require("../sockets/wins");

module.exports = () => {
    describe("Testing Wins Socket", () => {
      let io, serverSocket, clientSocket;
  
      beforeAll((done) => {
        io = new Server(3001);
        WinsSocket(io);
        clientSocket = new Client("http://localhost:3001");
  
        io.on("connection", (socket) => {
          serverSocket = socket;
        });
  
        clientSocket.on("connect", done);
      });
  
      afterAll(() => {
        io.close();
        clientSocket.close();
      });
  
      it("should emit when connected", (done) => {
        clientSocket.on("Users_by_wins", (data) => {
          expect(data).toEqual([
            { username: 'TestUser', wins: 2 },
            { username: 'Username', wins: 1 }
          ]);
          done();
        });
      });
  
      it("should stop interval when disconnected", (done) => {
        clientSocket.disconnect();
        setTimeout(() => {
          expect(serverSocket.connected).toBe(false);
          done();
        }, 100);
      });
    });
}