const { Server } = require("socket.io");
const Client = require("socket.io-client");
const CategoriesSocket = require("../sockets/categories");

module.exports = () => {
    describe("Testing Categories Socket", () => {
      let io, serverSocket, clientSocket;
  
      beforeAll((done) => {
        io = new Server(3001);
        CategoriesSocket(io);
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
        clientSocket.on("Categories", (data) => {
          expect(data.length).toEqual(5);
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