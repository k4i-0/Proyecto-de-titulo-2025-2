import { useState } from "react";
import { Button, Alert, Modal, Typography, Space } from "antd";
import { eliminarProducto } from "../../../services/inventario/Productos.service";

const { Text } = Typography;

export default function Eliminar({
  modalEliminar,
  setModalEliminar,
  productoEliminar,
  funcionBuscarProductos,
  setProductoEliminar,
  setProductos,
}) {
  const [loading, setLoading] = useState(false);
  // Se inicializa en "" (string vacío) para que la lógica del Alert funcione
  const [mensaje, setMensaje] = useState("");

  const handleCerrarModal = () => {
    setModalEliminar(false);
    // Es buena práctica resetear el mensaje al cerrar
    setMensaje("");
  };

  const handleEliminar = async () => {
    setLoading(true);
    setMensaje(""); // Limpiar mensajes anteriores
    try {
      const resultado = await eliminarProducto(productoEliminar.idProducto);
      console.log("Resultado de eliminar:", resultado);

      if (resultado.status === 200) {
        setProductos([]);
        funcionBuscarProductos();
        console.log("Producto eliminado con éxito");
        setModalEliminar(false);
        setProductoEliminar(null);
        funcionBuscarProductos();
        // No es necesario setLoading(false) aquí, el modal se cierra
      } else {
        // Manejar errores de la API
        if (resultado.status === 404) {
          setMensaje("Error al eliminar el producto");
        } else if (resultado.status === 422) {
          setMensaje("ID de producto es obligatorio");
        } else if (resultado.status === 500) {
          setMensaje("Error en el servidor al eliminar el producto");
        } else {
          setMensaje("Ocurrió un error inesperado.");
        }
        setLoading(false); // Detener loading solo si hubo error
      }
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      setMensaje("Error en la conexión o al procesar la solicitud.");
      setLoading(false); // Detener loading si la promesa falla
    }
  };

  return (
    <Modal
      open={modalEliminar}
      onCancel={handleCerrarModal}
      title="Eliminar Producto"
      centered
      footer={[
        <Button key="cancel" onClick={handleCerrarModal} disabled={loading}>
          Cancelar
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger // Hace el botón rojo
          loading={loading}
          onClick={handleEliminar}
        >
          Eliminar
        </Button>,
      ]}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* El Alert ahora solo se muestra si hay un mensaje de error, 
            ya que el botón 'loading' indica la acción en curso. */}
        {mensaje && (
          <Alert
            message={mensaje}
            type="error" // 'danger' en Bootstrap es 'error' en Antd
            showIcon
          />
        )}

        {/* Muestra el mensaje de eliminación si no hay error y no está cargando */}
        {!loading && !mensaje && (
          <Space direction="vertical">
            <Text>¿Estás seguro de que deseas eliminar el producto?</Text>
            <Text strong>{productoEliminar?.nombre}</Text>
          </Space>
        )}

        {/* Muestra un estado de "Eliminando..." si está cargando y no hay error */}
        {loading && !mensaje && (
          <Alert message="Eliminando producto..." type="info" showIcon />
        )}
      </Space>
    </Modal>
  );
}
