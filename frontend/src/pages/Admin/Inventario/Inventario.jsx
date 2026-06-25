import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Typography,
  Space,
  Empty,
  Spin,
  Select,
  notification,
  Card,
  Tag,
  Statistic,
  Row,
  Col,
  Modal,
  Form,
} from "antd";

import { LoadingOutlined, ReloadOutlined } from "@ant-design/icons";

import DataTable from "../../../components/Tabla";
import ModalIngresoManualProductos from "../../../components/ModalIngresoManualProductos";
import obtenerInventarios from "../../../services/inventario/Inventario.service";
import obtenerSucursales from "../../../services/inventario/Sucursal.service";

import { obtenerLotesAsociadosInventario } from "../../../services/inventario/Lote.service";
import { buscarTodosProductos } from "../../../services/functions/Productos";
import { buscarTodasSucursales } from "../../../services/functions/Sucursales";
import { buscarBodegasPorSucursal } from "../../../services/functions/Bodegas";
import { ingresoManualProductos } from "../../../services/inventario/Inventario.service";

const estadoColores = {
  Bueno: "success",
  Malo: "warning",
  Roto: "error",
  Vendido: "default",
  Vencido: "purple",
};

export default function Inventario() {
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalLotesVisible, setModalLotesVisible] = useState(false);
  const [lotes, setLotes] = useState([]);
  const [modalIngresoVisible, setModalIngresoVisible] = useState(false);
  const [productos, setProductos] = useState([]);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);
  const [bodegasIngreso, setBodegasIngreso] = useState([]);
  const [detalleIngreso, setDetalleIngreso] = useState([]);

  const [formIngreso] = Form.useForm();

  const obtenerSucursalCasaMatriz = (listaSucursales) => {
    if (!Array.isArray(listaSucursales) || listaSucursales.length === 0) {
      return null;
    }

    return (
      listaSucursales.find((sucursal) => {
        const nombre = String(sucursal?.nombre || "").toLowerCase();
        const alias = String(sucursal?.alias || "").toLowerCase();
        const descripcion = String(sucursal?.descripcion || "").toLowerCase();

        return (
          sucursal?.esCasaMatriz === true ||
          nombre.includes("casa matriz") ||
          alias.includes("casa matriz") ||
          descripcion.includes("casa matriz")
        );
      }) || listaSucursales[0]
    );
  };

  const cargarInventarios = useCallback(async (idSucursal) => {
    try {
      setLoading(true);
      const response = await obtenerInventarios(idSucursal);
      if (response?.status === 200) {
        setInventarios(Array.isArray(response.data) ? response.data : []);
      } else {
        setInventarios([]);
      }
    } catch (error) {
      console.error("Error al obtener inventarios:", error);
      setInventarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarSucursales = useCallback(async () => {
    setLoading(true);
    try {
      const response = await obtenerSucursales();
      if (response.status === 200) {
        const listaSucursales = Array.isArray(response.data)
          ? response.data
          : [];
        setSucursales(listaSucursales);

        const sucursalInicial = obtenerSucursalCasaMatriz(listaSucursales);
        if (sucursalInicial?.idSucursal) {
          setSucursalSeleccionada(sucursalInicial);
          await cargarInventarios(sucursalInicial.idSucursal);
        }
      } else {
        notification.error({
          message: "Error",
          description: response.error || "No se pudieron cargar las sucursales",
        });
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description: "Error de conexión",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [cargarInventarios]);

  useEffect(() => {
    buscarSucursales();
  }, [buscarSucursales]);

  const handleSucursalSeleccionada = (value) => {
    const sucursal = sucursales.find((s) => s.idSucursal === value);
    setSucursalSeleccionada(sucursal);
    cargarInventarios(value);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "—";
    const fechaParseada = new Date(fecha);
    if (Number.isNaN(fechaParseada.getTime())) return "—";
    return fechaParseada.toLocaleDateString("es-CL");
  };

  const columns = [
    {
      title: "Codigo Interno",
      dataIndex: "idInventario",
      key: "idInventario",
      width: "8%",
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Código Producto",
      dataIndex: ["producto", "codigo"],
      key: "codigo",
      width: "12%",
      align: "center",
      render: (v) => v || "—",
    },
    {
      title: "Producto",
      dataIndex: ["producto", "nombre"],
      key: "nombre",
      width: "15%",
      render: (v) => v || "—",
    },
    {
      title: "Bodega",
      dataIndex: ["bodega", "nombre"],
      key: "bodega",
      width: "15%",
      render: (v) => v || "—",
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: "10%",
      align: "center",
      sorter: (a, b) => (a.stock || 0) - (b.stock || 0),
      render: (stock) => (
        <Tag
          color={stock > 10 ? "success" : stock > 0 ? "warning" : "error"}
          style={{ fontSize: "13px" }}
        >
          {stock ?? 0}
        </Tag>
      ),
    },
    {
      title: "Stock Mín.",
      dataIndex: "stockMinimo",
      key: "stockMinimo",
      width: "8%",
      align: "center",
    },
    {
      title: "Stock Máx.",
      dataIndex: "stockMaximo",
      key: "stockMaximo",
      width: "8%",
      align: "center",
    },
    {
      title: "Stock Reservado",
      dataIndex: "stockReservado",
      key: "stockReservado",
      width: "8%",
      align: "center",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: "12%",
      align: "center",
      render: (estado) => (
        <Tag
          color={estadoColores[estado] || "default"}
          style={{ fontSize: "13px" }}
        >
          {estado || "—"}
        </Tag>
      ),
    },
    {
      title: "Lotes",
      align: "center",
      render: (_, record) => (
        <Button type="link" onClick={() => handleAbrirModal(record)}>
          Ver lotes
        </Button>
      ),
    },
  ];

  const buscarLotesInventario = async (idBodega, idProducto) => {
    try {
      const response = await obtenerLotesAsociadosInventario(
        idProducto,
        idBodega,
      );

      if (response.status === 200) {
        setLotes(Array.isArray(response.data) ? response.data : []);
        notification.success({
          message: "Éxito",
          description: "Lotes cargados correctamente",
        });
        return;
      } else {
        setLotes([]);
        notification.error({
          message: "Error",
          description: response.error || "No se pudieron cargar los lotes",
        });
        return;
      }
    } catch (error) {
      console.log("Error Obtener lotes de prodoucto", error);
      notification.error({
        message: "Error",
        description: "Error de conexión al cargar los lotes",
      });
      setLotes([]);
      return;
    }
  };

  const handleAbrirModal = (inventario) => {
    buscarLotesInventario(
      inventario.bodega.idBodega,
      inventario.producto.idProducto,
    );
    setModalLotesVisible(true);
  };

  const handleAbrirModalIngreso = async () => {
    await buscarTodosProductos(setProductos);
    await buscarTodasSucursales(setSucursalesDisponibles);

    setDetalleIngreso([]);
    formIngreso.resetFields();

    if (sucursalSeleccionada?.idSucursal) {
      formIngreso.setFieldsValue({ sucursal: sucursalSeleccionada.idSucursal });
      await buscarBodegasPorSucursal(
        sucursalSeleccionada.idSucursal,
        setBodegasIngreso,
      );
    } else {
      setBodegasIngreso([]);
    }

    setModalIngresoVisible(true);
  };

  const handleCerrarModalIngreso = () => {
    formIngreso.resetFields();
    setBodegasIngreso([]);
    setSucursalesDisponibles([]);
    setProductos([]);
    setDetalleIngreso([]);
    setModalIngresoVisible(false);
  };

  const handleOnChangeSucursalIngreso = async (idSucursal) => {
    formIngreso.setFieldsValue({ bodega: null });
    setBodegasIngreso([]);

    if (!idSucursal) return;

    await buscarBodegasPorSucursal(idSucursal, setBodegasIngreso);
  };

  const handleAgregarDetalle = () => {
    const values = formIngreso.getFieldsValue();

    if (
      !values.producto ||
      !values.cantidad ||
      !values.sucursal ||
      !values.bodega
    ) {
      notification.warning({
        message: "Campos incompletos",
        description:
          "Por favor completa todos los campos para agregar el detalle.",
        duration: 3,
      });
      return;
    }

    const productoSeleccionado = productos.find(
      (p) => p.idProducto === values.producto,
    );
    const bodegaSeleccionada = bodegasIngreso.find(
      (b) => b.idBodega === values.bodega,
    );
    const sucursalIngresoSeleccionada = sucursalesDisponibles.find(
      (s) => s.idSucursal === values.sucursal,
    );

    if (
      !productoSeleccionado ||
      !bodegaSeleccionada ||
      !sucursalIngresoSeleccionada
    ) {
      notification.error({
        message: "Error",
        description:
          "No se pudo resolver el producto, sucursal o bodega seleccionada.",
        duration: 3,
      });
      return;
    }

    const yaExiste = detalleIngreso.some(
      (item) =>
        item.idProducto === values.producto &&
        item.idSucursal === values.sucursal &&
        item.idBodega === values.bodega,
    );

    if (yaExiste) {
      setDetalleIngreso((prev) =>
        prev.map((item) => {
          if (
            item.idProducto === values.producto &&
            item.idSucursal === values.sucursal &&
            item.idBodega === values.bodega
          ) {
            return {
              ...item,
              cantidad: Number(item.cantidad) + Number(values.cantidad),
            };
          }
          return item;
        }),
      );

      notification.warning({
        message: "Producto ya agregado",
        description:
          "El producto ya estaba en el detalle; se actualizó la cantidad.",
        duration: 3,
      });
      formIngreso.resetFields(["producto", "cantidad"]);
      return;
    }

    setDetalleIngreso((prev) => [
      ...prev,
      {
        key: crypto.randomUUID(),
        idProducto: values.producto,
        productoNombre: productoSeleccionado.nombre,
        cantidad: Number(values.cantidad),
        idBodega: values.bodega,
        bodegaNombre: bodegaSeleccionada.nombre,
        idSucursal: values.sucursal,
        sucursalNombre: sucursalIngresoSeleccionada.nombre,
      },
    ]);

    formIngreso.resetFields(["producto", "cantidad"]);
  };

  const handleEditarCantidad = (key, nuevaCantidad) => {
    setDetalleIngreso((prev) =>
      prev.map((row) =>
        row.key === key ? { ...row, cantidad: nuevaCantidad } : row,
      ),
    );
  };

  const handleEliminarFila = (key) => {
    setDetalleIngreso((prev) => prev.filter((row) => row.key !== key));
  };

  const enviarIngresoManual = async () => {
    try {
      setLoading(true);
      const response = await ingresoManualProductos(detalleIngreso);
      if (response?.status === 200) {
        notification.success({
          message: "Ingreso exitoso",
          description: "Los productos han sido ingresados correctamente.",
          duration: 4,
        });
        handleCerrarModalIngreso();
        if (sucursalSeleccionada?.idSucursal) {
          cargarInventarios(sucursalSeleccionada.idSucursal);
        }
        return;
      }

      notification.error({
        message: "Error al ingresar productos",
        description:
          response?.error || "No se pudo completar el ingreso de productos.",
        duration: 4,
      });
    } catch (error) {
      console.log("error enviar datos ingreso manual", error);
      notification.error({
        message: "Error de conexión",
        description: "No se pudo conectar al servidor para ingresar productos.",
        duration: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const columnasLotes = [
    {
      title: "Código lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (v) => v || "—",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      align: "center",
      render: (estado) => (
        <Tag color={estado === "disponible" ? "success" : "default"}>
          {estado || "—"}
        </Tag>
      ),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 110,
      align: "center",
      render: (v) => v ?? 0,
    },
    {
      title: "Fecha creación",
      dataIndex: "fechaCreacion",
      key: "fechaCreacion",
      render: (v) => formatearFecha(v),
    },
    {
      title: "Fecha vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (v) => formatearFecha(v),
    },
  ];

  // Estadísticas rápidas
  const totalStock = inventarios.reduce(
    (s, i) => Number(s) + Number(i.stock || 0),
    0,
  );
  const sinStock = inventarios.filter((i) => (i.stock || 0) === 0).length;
  const bajoStock = inventarios.filter(
    (i) => (i.stock || 0) > 0 && (i.stock || 0) <= (i.stockMinimo || 0),
  ).length;

  if (loading && sucursales.length === 0) {
    return (
      <div style={{ padding: "24px", textAlign: "center" }}>
        <Spin
          indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
          tip="Cargando sucursales..."
          size="large"
          fullscreen
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* Selector de Sucursal */}
      <Card
        style={{
          marginBottom: 24,
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <Row gutter={[24, 16]} align="middle">
          {/* Izquierda — métricas */}
          <Col xs={24} md={14}>
            {sucursalSeleccionada && inventarios.length > 0 ? (
              <Row gutter={[12, 12]}>
                <Col xs={8}>
                  <Card
                    style={{
                      borderRadius: "10px",
                      background: "#f6ffed",
                      border: "1px solid #b7eb8f",
                    }}
                  >
                    <Statistic
                      title="Stock total"
                      value={totalStock}
                      valueStyle={{ color: "#52c41a" }}
                    />
                  </Card>
                </Col>
                <Col xs={8}>
                  <Card
                    style={{
                      borderRadius: "10px",
                      background: "#fffbe6",
                      border: "1px solid #ffe58f",
                    }}
                  >
                    <Statistic
                      title="Bajo stock"
                      value={bajoStock}
                      valueStyle={{ color: "#faad14" }}
                    />
                  </Card>
                </Col>
                <Col xs={8}>
                  <Card
                    style={{
                      borderRadius: "10px",
                      background: "#fff2f0",
                      border: "1px solid #ffccc7",
                    }}
                  >
                    <Statistic
                      title="Sin stock"
                      value={sinStock}
                      valueStyle={{ color: "#ff4d4f" }}
                    />
                  </Card>
                </Col>
              </Row>
            ) : (
              <Typography.Text type="secondary">
                Selecciona una sucursal para ver las métricas.
              </Typography.Text>
            )}
          </Col>

          {/* Derecha — selector */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              <Typography.Text strong style={{ fontSize: 14 }}>
                Sucursal
              </Typography.Text>
              <Select
                style={{ width: "100%" }}
                size="large"
                placeholder="Seleccionar sucursal"
                value={sucursalSeleccionada?.idSucursal}
                onChange={handleSucursalSeleccionada}
                loading={loading}
                allowClear
                onClear={() => {
                  setSucursalSeleccionada(null);
                  setInventarios([]);
                }}
              >
                {sucursales.map((s) => (
                  <Select.Option key={s.idSucursal} value={s.idSucursal}>
                    {s.nombre} — {s.direccion}
                  </Select.Option>
                ))}
              </Select>
              {sucursalSeleccionada && (
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() =>
                    cargarInventarios(sucursalSeleccionada.idSucursal)
                  }
                  loading={loading}
                  block
                >
                  Recargar
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Tabla de Inventario */}
      {sucursalSeleccionada ? (
        <DataTable
          title="Inventario de Productos"
          description={`Sucursal: ${sucursalSeleccionada.nombre}`}
          data={inventarios}
          columns={columns}
          rowKey="idInventario"
          loading={loading}
          searchPlaceholder="Buscar por producto o código..."
          searchableFields={["producto.nombre", "producto.codigo"]}
          filterConfig={[
            {
              key: "estado",
              placeholder: "Filtrar por estado",
              options: [
                { value: "Bueno", label: "Bueno" },
                { value: "Malo", label: "Malo" },
                { value: "Roto", label: "Roto" },
                { value: "Vendido", label: "Vendido" },
                { value: "Vencido", label: "Vencido" },
              ],
            },
          ]}
          headerButtons={
            <Space wrap>
              <Button type="primary" onClick={handleAbrirModalIngreso}>
                Ingreso manual de productos
              </Button>
            </Space>
          }
        />
      ) : (
        <Empty
          description="Selecciona una sucursal para ver su inventario"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
      <ModalIngresoManualProductos
        open={modalIngresoVisible}
        onCancel={handleCerrarModalIngreso}
        onConfirm={enviarIngresoManual}
        form={formIngreso}
        productos={productos}
        sucursalesDisponibles={sucursalesDisponibles}
        bodegas={bodegasIngreso}
        detalleIngreso={detalleIngreso}
        onAgregarDetalle={handleAgregarDetalle}
        onChangeSucursalIngreso={handleOnChangeSucursalIngreso}
        onEditarCantidad={handleEditarCantidad}
        onEliminarFila={handleEliminarFila}
      />
      {/* Modal de Lotes */}
      <Modal
        open={modalLotesVisible}
        onCancel={() => setModalLotesVisible(false)}
        footer={null}
        width={800}
      >
        <Typography.Title level={4}>Lotes del producto</Typography.Title>

        {lotes.length > 0 ? (
          <DataTable
            data={lotes}
            columns={columnasLotes}
            rowKey="idLote"
            pagination={false}
            searchableFields={["codigoLote", "estado", "idLote", "cantidad"]}
            searchPlaceholder="Buscar lote..."
          />
        ) : (
          <Empty
            description="No hay lotes asociados para este producto en esta bodega"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    </div>
  );
}
