import express from "express"; 
import { engine } from "express-handlebars"; 
import { Server } from "socket.io"; 
import productRouter from "./routes/products.router.js"; 
import cartRouter from "./routes/carts.router.js"; 
import viewsRouter from "./routes/views.router.js"; 
import Product from "./models/product.model.js";  // Importar el modelo de productos
import Cart from "./models/cart.model.js";  // Importar el modelo de carritos
const app = express(); 
const PUERTO = 8080;
import "./database.js";  //Aseguramos la conexión a la base de datos

// Middleware:
app.use(express.json()); 
app.use(express.static("./src/public"));  //archivos estáticos

// Configuración de Express-Handlebars:
app.engine("handlebars", engine()); 
app.set("view engine", "handlebars"); 
app.set("views", "./src/views"); 

// Rutas
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);
app.use("/", viewsRouter);

const httpServer = app.listen(PUERTO, () => {
    console.log(`Escuchando en http://localhost:${PUERTO}`); 
});

// instancia de Socket.io del lado del backend
const io = new Server(httpServer);

// Manejo de productos en tiempo real con WebSockets
io.on("connection", async (socket) => {
    console.log("Un cliente se conectó");

    //  array de productos al cliente
    socket.emit("productos", await Product.find());  // Obtener productos de MongoDB

    // Agregamos productos nuevos
    socket.on("agregarProducto", async (producto) => {
        try {
            const nuevoProducto = new Product(producto);
            await nuevoProducto.save();
            // Emitir lista de productos actualizada a todos los clientes
            io.sockets.emit("productos", await Product.find());
        } catch (error) {
            console.error("Error al agregar el producto:", error);
        }
    });

    // Eliminamos un producto
    socket.on("eliminarProducto", async (id) => {
        try {
            await Product.findByIdAndDelete(id);  // Eliminar producto por id
            // Emitir lista de productos actualizada
            io.sockets.emit("productos", await Product.find());
        } catch (error) {
            console.error("Error al eliminar el producto:", error);
        }
    });
});

