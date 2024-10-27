import express from "express"; 
import ProductManager from "../managers/product-manager.js";
const manager = new ProductManager("./src/data/productos.json");
const router = express.Router();

//La ruta raíz GET 
//asincronico
router.get("/", async (req, res) => {
    try {
        const limit = req.query.limit; //esto me permite limitar cuantos products se solicitan
        const productos = await manager.getProducts();  //en nuestro query debe usarse la misma palabra del url 

        if(limit) {
            res.json(productos.slice(0, limit)); 
        } else {
            res.json(productos); 
        }
    } catch (error) {
        res.status(500).send("Error interno del servidor");
    }
})

//2) La ruta GET /:pid deberá traer sólo el producto con el id proporcionado

router.get("/:pid", async (req, res) => {
    let id = req.params.pid; 

    try {
        const productoBuscado = await manager.getProductById(parseInt(id));

        if(!productoBuscado) {
            res.send("Producto no encontrado");
        } else {
            res.json(productoBuscado); 
        }
    } catch (error) {
        res.status(500).send("Error en el servidor"); 
    }
})

//3) La ruta raíz POST / para  agregar un nuevo producto

router.post("/", async (req, res) => {
    const nuevoProducto = req.body; 

    try {
        await manager.addProduct(nuevoProducto); 
        res.status(201).send("Producto agregado exitosamente");
    } catch (error) {
        res.status(500).send("Error al momento de agregar el producto"); 
    }

})

//4) Actualizar! 
// Ruta para actualizar un producto
router.put("/:pid", async (req, res) => {
    const id = parseInt(req.params.pid);
    const productoActualizado = req.body;

    try {
        await manager.updateProduct(id, productoActualizado);
        res.send("Producto actualizado exitosamente");
    } catch (error) {
        res.status(500).send("Error al actualizar el producto");
    }
});


//5) La ruta DELETE /:pid deberá eliminar el producto con el pid indicado. 

router.delete("/:pid", async (req, res) => {
    let id = req.params.pid; 

    try {
        await manager.deleteProduct(parseInt(id)); 
        res.send("Producto eliminado")
    } catch (error) {
        res.status(500).send("Error, no se logro borrar el producto"); 
    }
})


export default router; 