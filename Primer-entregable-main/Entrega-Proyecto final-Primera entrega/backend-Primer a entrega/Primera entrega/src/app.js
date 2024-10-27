import express from "express"; 
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import productRouter from "./routes/products.router.js";
import cartRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";
const app = express(); 
const PUERTO = 8080;
//Middleware: 
app.use(express.json()); 
//Le decimos al servidor que vamos a trabajar con JSON.
app.use(express.static("./src/public"));

//Configuramos Express-Handlebars
app.engine("handlebars", engine()); 
app.set("view engine", "handlebars"); 
app.set("views", "./src/views"); 

//Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);


const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en el http://localhost:${PUERTO}`); 
})

//Creamos la instancia de Socket.io del lado del backend. 
const io = new Server(httpServer); 

//Debo traer el array de productos: 
import ProductManager from "./managers/product-manager.js";
const manager = new ProductManager("./src/data/productos.json");

io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    //Enviamos el array de productos al cliente:
    socket.emit("productos", await manager.getProducts());

    //Agregamos productos nuevos: 
    socket.on("agregarProducto", async (producto) => {
        await manager.addProduct(producto);
        //Actualizar la vista de productos en stock
        io.sockets.emit("productos", await manager.getProducts());
    })

    //Eliminamos un producto:
    socket.on("eliminarProducto", async (id) => {
        await manager.deleteProduct(id); 

        //No se olviden! Enviar la lista actualizada de productos!
        io.sockets.emit("productos", await manager.getProducts());
    })
})