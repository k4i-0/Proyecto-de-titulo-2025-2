import { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Space,
  Empty,
  Tag,
  Tooltip,
  notification,
  Popconfirm,
} from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  InboxOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router-dom";

import DataTable from "../../../components/Tabla";
import CrearSucursal from "../modales/modalSucursal/CrearSucursal";
import EditarSucursal from "../modales/modalSucursal/EditarSucursal";

import obtenerSucursales, {
  eliminarSucursal,
} from "../../../services/inventario/Sucursal.service";
import KPIStats from "../../../components/Kpis";

export default function Sucursal() {
  const navigate = useNavigate();
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucursalSelect, setSucursalSelect] = useState(null);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);

  const buscarSucursales = async () => {
    try {
      setLoading(true);

      const respuesta = await obtenerSucursales();
      if (respuesta.status == 204) {
        notification.info({
          message: "Información",
          description: "No hay sucursales disponibles.",
        });
      } else {
        if (respuesta.status === 200) {
          setSucursales(respuesta.data);
        }
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error al cargar datos",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buscarSucursales();
  }, []);

  const handleCerrarModal = () => {
    setModalCrear(false);
    setModalEditar(false);
  };

  const handleCrear = () => {
    setModalCrear(true);
  };

  const handleEditar = (sucursal) => {
    setSucursalSelect(sucursal);

    setModalEditar(true);
  };

  const handleEliminar = async (sucursal) => {
    setLoading(true);

    try {
      const respuesta = await eliminarSucursal(sucursal.idSucursal);
      if (respuesta.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Sucursal eliminada exitosamente",
        });
        //

        setSucursalSelect(null);
        await buscarSucursales();
      } else {
        notification.error({
          message: "Error",
          description: respuesta.error || "Error al eliminar la sucursal.",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error de conexión al eliminar la sucursal.",
      });

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionarCard = (record) => {
    navigate("/admin/sucursal/" + record.idSucursal);
    // if (sucursalSelect?.idSucursal === record.idSucursal) {
    //   setSucursalSelect(null);
    // } else {
    //   setSucursalSelect(record);
    //   //console.log("Navegando a detalles de sucursal:", record);
    //   navigate("/admin/sucursal/" + record.idSucursal);
    // }
  };

  const handleVerBodegas = (idSucursal, e) => {
    if (e) e.stopPropagation();

    navigate("/admin/bodega/" + idSucursal);
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      Abierta: {
        color: "success",
        icon: <CheckCircleOutlined />,
        text: "Abierta",
      },
      Cerrada: {
        color: "error",
        icon: <CloseCircleOutlined />,
        text: "Cerrada",
      },
      Mantencion: {
        color: "warning",
        icon: <ToolOutlined />,
        text: "Mantenimiento",
      },
      Eliminada: {
        color: "default",
        icon: <DeleteOutlined />,
        text: "Eliminada",
      },
    };
    return configs[estado] || configs.Eliminada;
  };

  const columns = [
    {
      title: "Sucursal",
      dataIndex: "nombre",
      key: "nombre",
      width: "25%",
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Typography.Text strong style={{ fontSize: "15px" }}>
            <a onClick={() => navigate(`/admin/sucursal/${record.idSucursal}`)}>
              {text}
            </a>
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
            ID: {record.idSucursal}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      width: "30%",
      render: (text) => (
        <Space>
          <EnvironmentOutlined style={{ color: "#8c8c8c" }} />
          <Typography.Text>{text}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "15%",
      align: "center",
      render: (estado) => {
        const estadoConfig = getEstadoConfig(estado);
        return (
          <Tag
            icon={estadoConfig.icon}
            color={estadoConfig.color}
            style={{ fontWeight: 600, fontSize: "13px" }}
          >
            {estadoConfig.text}
          </Tag>
        );
      },
    },
    {
      title: "Bodegas",
      key: "bodegas",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<InboxOutlined />}
          onClick={(e) => handleVerBodegas(record.idSucursal, e)}
        >
          Ver Bodegas
        </Button>
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: "15%",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Editar Sucursal">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEditar(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Detalles Sucursal">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleSeleccionarCard(record);
              }}
            />
          </Tooltip>
          <Tooltip title="Eliminar Sucursal">
            <Popconfirm
              title="¿Está seguro de eliminar esta sucursal?"
              description={`Se eliminará la sucursal: ${record.nombre}`}
              onConfirm={(e) => {
                e?.stopPropagation();
                handleEliminar(record);
              }}
              okText="Sí, eliminar"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      {/* KPIs */}
      {sucursales.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <KPIStats
            datos={[
              {
                titulo: "Total De Sucursales",
                valor: sucursales.length,
                prefijo: <ShopOutlined />,
                estiloValor: { color: "#1890ff" },
              },
              {
                titulo: "Sucursales Abiertas",
                valor: sucursales.filter((s) => s.estado === "Abierta").length,
                prefijo: <ShopOutlined />,
                estiloValor: { color: "#52c41a" },
              },
              {
                titulo: "Sucursales Cerradas",
                valor: sucursales.filter((s) => s.estado === "Cerrada").length,
                prefijo: <ShopOutlined />,
                estiloValor: { color: "#ff491bff" },
              },
              {
                titulo: "En Mantenimiento",
                valor: sucursales.filter((s) => s.estado === "Mantencion")
                  .length,
                prefijo: <ShopOutlined />,
                estiloValor: { color: "#faad14" },
              },
            ]}
          />
        </div>
      )}

      {/* Tabla con DataTable */}
      <DataTable
        title="Gestión de Sucursales"
        description="Administra las sucursales de tu empresa"
        data={sucursales}
        columns={columns}
        rowKey="idSucursal"
        loading={loading}
        searchableFields={["nombre", "direccion", "idSucursal"]}
        filterConfig={[
          {
            key: "estado",
            placeholder: "Filtrar por estado",
            options: [
              { value: "Abierta", label: "Abierta" },
              { value: "Cerrada", label: "Cerrada" },
              { value: "Mantencion", label: "Mantenimiento" },
            ],
          },
        ]}
        //onRowClick={handleSeleccionarCard}
        selectedRow={sucursalSelect}
        headerButtons={
          <Space size="middle">
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCrear}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Nueva Sucursal
            </Button>
            <Button
              size="large"
              icon={<ShopOutlined />}
              onClick={() => navigate("/admin/proveedores")}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Proveedores
            </Button>
            <Button
              size="large"
              onClick={() => navigate("/admin/productos")}
              disabled={loading}
              style={{ borderRadius: "8px" }}
            >
              Productos
            </Button>
          </Space>
        }
      />

      {/* Modales */}
      <CrearSucursal
        show={modalCrear}
        handleClose={handleCerrarModal}
        buscarSucursales={buscarSucursales}
      />
      <EditarSucursal
        show={modalEditar}
        handleClose={handleCerrarModal}
        sucursal={sucursalSelect}
        funcionBuscarSucursales={buscarSucursales}
      />
    </div>
  );
}
