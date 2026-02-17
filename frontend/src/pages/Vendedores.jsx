import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Alert,
  Space,
  Empty,
  Spin,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LoadingOutlined,
  RollbackOutlined,
} from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";

import DataTable from "../components/Tabla";
import AgregarVendedor from "./inventario/modalVendedor/AgregarVendedor";
import EditarVendedor from "./inventario/modalVendedor/EditarVendedor";

import {
  getAllProveedoresVendedor,
  eliminarVendedor,
} from "../services/inventario/Proveedor.service";

export default function Vendedores() {
  console.log("Renderizando componente Vendedores");
  const { Title, Text } = Typography;
  const navigate = useNavigate();
  const { rutProveedor } = useParams();

  const [vendedores, setVendedores] = useState([]);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [vendedorSelect, setVendedorSelect] = useState(null);

  const [error, setError] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  // 3. Lógica de búsqueda adaptada
  const buscarVendedores = async () => {
    if (!rutProveedor) return;

    try {
      setLoading(true);
      setError(false);
      setMensaje("");
      // Usando el servicio de vendedor
      const respuesta = await getAllProveedoresVendedor(rutProveedor);
      console.log("Respuesta al buscar vendedores:", respuesta.data);
      if (respuesta.status === 500) {
        setError(true);
        setMensaje("Error en el servidor");
        setVendedores([]);
        return;
      }
      if (respuesta.status === 204) {
        setVendedores([]);
      } else if (respuesta.data) {
        setVendedores(respuesta.data);
      } else if (Array.isArray(respuesta)) {
        setVendedores(respuesta);
      }
    } catch (err) {
      setError(true);
      setMensaje("Error de conexión al cargar los vendedores.");
      console.error(err);
      setVendedores([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. USEEFFECT CORREGIDO: Depende de 'rutProveedor'
  useEffect(() => {
    buscarVendedores();
  }, [rutProveedor]); // Se ejecutará cada vez que el RUT de la URL cambie

  // --- Handlers Adaptados ---
  const handleCrear = () => {
    setError(false);
    setMensaje("");
    setVendedorSelect(null);
    setModalCrear(true);
  };

  const handleAbrirModalEditar = () => {
    if (!vendedorSelect) {
      setError(true);
      setMensaje("Por favor seleccione un vendedor de la tabla");
      return;
    }
    setError(false);
    setMensaje("");
    setModalEditar(true);
  };

  // 3. ELIMINAR CORREGIDO: Usa 'idVendedorProveedor'
  const handleEliminarConfirmado = async () => {
    if (!vendedorSelect) {
      // ... (manejo de error)
      return;
    }
    setLoading(true);
    // ... (resto del try/catch)
    try {
      // Usa la clave correcta
      const respuesta = await eliminarVendedor(
        vendedorSelect.idVendedorProveedor
      );
      if (respuesta.status === 200) {
        setMensaje("Vendedor eliminado exitosamente");
        setError(false);
        setVendedorSelect(null);
        await buscarVendedores();
      } else {
        setError(true);
        setMensaje(respuesta.error || "Error al eliminar el vendedor.");
      }
    } catch (error) {
      // ... (manejo de error)
      setError(true);
      setMensaje("Error de conexión al eliminar el vendedor.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  // 3. SELECCIÓN CORREGIDA: Usa 'idVendedorProveedor'
  const handleSeleccionarFila = (record) => {
    if (vendedorSelect?.idVendedorProveedor === record.idVendedorProveedor) {
      setVendedorSelect(null);
    } else {
      setVendedorSelect(record);
    }
  };

  // const getEstadoColor = (estado) => {
  //   const estadoLower = estado?.toLowerCase() || "";
  //   switch (estadoLower) {
  //     case "activo":
  //       return "success";
  //     case "inactivo":
  //       return "error";
  //     default:
  //       return "default";
  //   }
  // };

  const columns = [
    {
      title: "ID",
      dataIndex: "idVendedorProveedor",
      key: "idVendedorProveedor",
      width: "12%",
      align: "center",
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "RUT",
      dataIndex: "rut",
      key: "rut",
      width: "15%",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "25%",
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      width: "15%",
    },
  ];

  // Renderizado condicional para estados de carga y vacío
  if (loading && vendedores.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando vendedores..."
          size="large"
        />
      </div>
    );
  }

  if (vendedores.length === 0 && !loading) {
    return (
      <div style={{ padding: "24px" }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size="large">
              <div>
                <Typography.Title level={4}>
                  No hay vendedores disponibles
                </Typography.Title>
                <Typography.Text type="secondary">
                  Agrega el primer vendedor para este proveedor
                </Typography.Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCrear}
              >
                Crear Primer Vendedor
              </Button>
            </Space>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Alerta de Mensajes */}
      {mensaje && (
        <Alert
          message={mensaje}
          type={error ? "error" : "success"}
          showIcon
          closable
          onClose={() => setMensaje("")}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Alerta de Selección */}
      {vendedorSelect && (
        <Alert
          message={`Vendedor seleccionado: ${vendedorSelect.nombre}`}
          type="info"
          showIcon
          closable
          onClose={() => setVendedorSelect(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Tabla con DataTable Component */}
      <DataTable
        title="Gestión de Vendedores"
        description={`Vendedores del proveedor RUT: ${rutProveedor}`}
        data={vendedores}
        columns={columns}
        rowKey="idVendedorProveedor"
        loading={loading}
        searchableFields={["nombre", "rut", "email", "telefono"]}
        onRowClick={handleSeleccionarFila}
        selectedRow={vendedorSelect}
        headerButtons={
          <Space size="middle">
            <Button
              size="large"
              icon={<RollbackOutlined />}
              onClick={() => navigate(-1)}
              style={{ borderRadius: "8px" }}
            >
              Volver a Proveedores
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCrear}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Nuevo Vendedor
            </Button>
            <Button
              size="large"
              icon={<EditOutlined />}
              onClick={handleAbrirModalEditar}
              disabled={loading || !vendedorSelect}
              style={{ borderRadius: "8px" }}
            >
              Editar
            </Button>
            <Popconfirm
              title="¿Eliminar vendedor?"
              description={`Se eliminará: ${vendedorSelect?.nombre || ""}`}
              onConfirm={handleEliminarConfirmado}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
              disabled={!vendedorSelect || loading}
            >
              <Button
                size="large"
                icon={<DeleteOutlined />}
                disabled={loading || !vendedorSelect}
                danger
                style={{ borderRadius: "8px" }}
              >
                Eliminar
              </Button>
            </Popconfirm>
          </Space>
        }
      />

      {/* Modales */}
      <AgregarVendedor
        show={modalCrear}
        handleClose={handleCerrarModal}
        funcionBuscarVendedores={buscarVendedores}
        rutProveedor={rutProveedor}
      />
      <EditarVendedor
        Vendedor={vendedorSelect}
        modalEditar={modalEditar}
        handleCerrarModal={handleCerrarModal}
        funcionBuscarVendedores={buscarVendedores}
        rutProveedor={rutProveedor}
      />
    </div>
  );
}
