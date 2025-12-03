import { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Button,
  Table,
  Alert,
  Space,
  Popconfirm,
  Empty,
  Spin,
  Row,
  Col,
  Divider,
  notification,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

import {
  getAllEstantesBodega,
  eliminarEstante,
} from "../../../services/inventario/Estante.service";

import CrearEstante from "./CrearEstante";
import EditarEstante from "./EditarEstante";

export default function GestionEstantes({ bodegaId }) {
  const { Text } = Typography;
  const [loading, setLoading] = useState(false);
  // const [mensaje, setMensaje] = useState("");
  // const [error, setError] = useState(false);
  const [modalCrearEstante, setModalCrearEstante] = useState(false);
  const [modalEditarEstante, setModalEditarEstante] = useState(false);
  const [estantes, setEstantes] = useState([]);
  const [estanteSeleccionado, setEstanteSeleccionado] = useState(null);

  //   console.log("GestionEstantes - ID de Bodega recibido:", bodegaId);

  const estantesCargarBodega = useCallback(async () => {
    if (!bodegaId) return;

    try {
      setLoading(true);
      // setError(false);
      // setMensaje("");
      const respuesta = await getAllEstantesBodega(bodegaId);

      //   console.log("Respuesta completa:", respuesta);
      //   console.log("Respuesta.data:", respuesta.data);

      if (respuesta.status === 200) {
        // ✅ Convertir a array si es un objeto único
        const estantesData = Array.isArray(respuesta.data)
          ? respuesta.data
          : [respuesta.data];

        setEstantes(estantesData);
        notification.success({
          message: "Éxito",
          description: "Los estantes se cargaron correctamente",
          placement: "topRight",
          duration: 4.5,
        });
        // setMensaje("");
      } else if (respuesta.status === 204) {
        setEstantes([]);
        notification.success({
          message: "Éxito",
          description: "No hay estantes disponibles para esta bodega.",
          placement: "topRight",
          duration: 4.5,
        });
        //setMensaje("No hay estantes disponibles para esta bodega.");
      } else {
        // setError(true);
        notification.error({
          message: "Error",
          description:
            respuesta.error || "Error del servidor al cargar los estantes.",
        });
        //setMensaje("Error del servidor al cargar los estantes.");
      }
    } catch (error) {
      // setError(true);
      // setMensaje("Error al cargar los estantes.");
      console.error("Error al cargar los estantes:", error);
      setEstantes([]);
    } finally {
      setLoading(false);
    }
  }, [bodegaId]);

  useEffect(() => {
    estantesCargarBodega();
  }, [estantesCargarBodega]);

  const handleCrear = () => {
    // setError(false);
    // setMensaje("");
    setEstanteSeleccionado(null);
    setModalCrearEstante(true);
  };

  const handleEditar = () => {
    if (!estanteSeleccionado) {
      // setError(true);
      // setMensaje("Por favor seleccione un estante de la tabla");
      notification.error({
        message: "Error",
        description: "Por favor seleccione un estante de la tabla",
      });
      return;
    }
    // setError(false);
    // setMensaje("");
    setModalEditarEstante(true);
  };

  const handleEliminar = async () => {
    if (!estanteSeleccionado) {
      // setError(true);
      notification.error({
        message: "Error",
        description: "Por favor seleccione un estante de la tabla",
      });
      // setMensaje("Por favor seleccione un estante de la tabla");
      return;
    }

    setLoading(true);
    // setError(false);
    // setMensaje("");

    try {
      const respuesta = await eliminarEstante(estanteSeleccionado.idEstante);

      if (respuesta.status === 200) {
        await estantesCargarBodega();
        // setMensaje("Estante eliminado exitosamente");
        notification.success({
          message: "Éxito",
          description: "La operación se completó correctamente",
          placement: "topRight",
          duration: 4.5,
        });
        // setError(false);
        setEstanteSeleccionado(null);
      } else if (respuesta.status === 404) {
        // setError(true);
        notification.error({
          message: "Error",
          description: "Hubo un problema al procesar la solicitud",
        });
        // setMensaje("Estante no encontrado");
      } else {
        // setError(true);
        notification.error({
          message: "Error",
          description:
            respuesta.error || "Hubo un problema al procesar la solicitud",
        });
        // setMensaje(respuesta.error || "Error al eliminar el estante");
      }
    } catch (err) {
      // setError(true);
      // setMensaje("Error de conexión al eliminar.");
      console.error("Error al eliminar el estante:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrearEstante(false);
    setModalEditarEstante(false);
  };

  const handleSeleccionarFila = (record) => {
    if (estanteSeleccionado?.idEstante === record.idEstante) {
      setEstanteSeleccionado(null);
    } else {
      setEstanteSeleccionado(record);
    }
  };

  const columns = [
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
    },
    {
      title: "Tipo",
      dataIndex: "tipo",
      key: "tipo",
    },
    {
      title: "Capacidad",
      dataIndex: "capacidad",
      key: "capacidad",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        const colores = {
          Habilitado: "#52c41a",
          Inhabilitado: "#ff4d4f",
          Mantenimiento: "#faad14",
          Reservado: "#1890ff",
        };
        return (
          <span
            style={{ color: colores[estado] || "#8c8c8c", fontSize: "12px" }}
          >
            {estado}
          </span>
        );
      },
    },
  ];

  if (loading && estantes.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px" }}>
        <Spin tip="Cargando estantes..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "0 8px" }}>
      {/* {mensaje && (
        <Alert
          type={error ? "error" : "success"}
          showIcon
          message={mensaje}
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 12, fontSize: "12px" }}
        />
      )} */}

      {estanteSeleccionado && (
        <Alert
          message={
            <Text style={{ fontSize: "12px" }}>
              <strong>Seleccionado:</strong> {estanteSeleccionado.codigo}
            </Text>
          }
          type="info"
          showIcon
          closable
          onClose={() => setEstanteSeleccionado(null)}
          style={{ marginBottom: 12 }}
        />
      )}

      <Space wrap style={{ marginBottom: 12, width: "100%" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCrear}
          disabled={loading}
          size="small"
        >
          Crear
        </Button>
        <Button
          icon={<EditOutlined />}
          onClick={handleEditar}
          disabled={loading || !estanteSeleccionado}
          size="small"
        >
          Editar
        </Button>
        <Popconfirm
          title="¿Eliminar estante?"
          description={`Se eliminará: ${estanteSeleccionado?.codigo || ""}`}
          onConfirm={handleEliminar}
          okText="Sí"
          cancelText="No"
          okButtonProps={{ danger: true }}
          disabled={!estanteSeleccionado}
        >
          <Button
            icon={<DeleteOutlined />}
            disabled={loading || !estanteSeleccionado}
            danger
            size="small"
          >
            Eliminar
          </Button>
        </Popconfirm>
      </Space>

      {estantes.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No hay estantes creados"
          style={{ padding: "20px 0" }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCrear}
            size="small"
          >
            Crear Primer Estante
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={estantes}
          rowKey="idEstante"
          loading={loading}
          pagination={{
            pageSize: 5,
            size: "small",
            showSizeChanger: false,
          }}
          size="small"
          onRow={(record) => ({
            onClick: () => handleSeleccionarFila(record),
            style: {
              cursor: "pointer",
              backgroundColor:
                estanteSeleccionado?.idEstante === record.idEstante
                  ? "#e6f4ff"
                  : "transparent",
              transition: "background-color 0.3s ease",
            },
          })}
          locale={{
            emptyText: "No hay estantes disponibles",
          }}
        />
      )}

      <CrearEstante
        show={modalCrearEstante}
        handleClose={handleCerrarModal}
        idBodega={bodegaId}
        estantesCargarBodega={estantesCargarBodega}
      />
      <EditarEstante
        show={modalEditarEstante}
        handleClose={handleCerrarModal}
        estante={estanteSeleccionado}
        estantesCargarBodega={estantesCargarBodega}
        bodegaId={bodegaId}
      />
    </div>
  );
}
