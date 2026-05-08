import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  notification,
  Tabs,
  Modal,
  Form,
  Input,
  Spin,
} from "antd";
import {
  EyeOutlined,
  ReloadOutlined,
  ShopOutlined,
  InboxOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

import DataTable from "../../components/Tabla";
import { obtenerInventarioPorSucursal } from "../../services/inventario/Inventario.service";

import { buscarTodasSucursales } from "../../services/functions/Sucursales";
import { buscarTodosProductos } from "../../services/functions/Productos";
import { buscarBodegasPorSucursal } from "../../services//functions/Bodegas";

import { ingresoManualProductos } from "../../services/inventario/Inventario.service";
const estadoColores = {
  Bueno: "green",
  Malo: "orange",
  Roto: "red",
  Vendido: "default",
  Vencido: "purple",
};

const { Text } = Typography;

export default function GestionInventario() {
  const [loading, setLoading] = useState(false);
  const [inventarios, setInventarios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [inventarioSeleccionado, setInventarioSeleccionado] = useState(null);

  const [modalIngreso, setModalIngreso] = useState(false);

  const [productos, setProductos] = useState([]);
  const [bodegas, setBodegas] = useState([]);
  const [sucursalesDisponibles, setSucursalesDisponibles] = useState([]);

  const [detalleIngreso, setDetalleIngreso] = useState([]);

  const [formIngreso] = Form.useForm();

  const cargarInventario = useCallback(
    async (idSucursalFiltro = null) => {
      setLoading(true);
      try {
        const inventarioResponse = await obtenerInventarioPorSucursal();
        if (inventarioResponse?.status === 200) {
          const sucursalesConInventario = Array.isArray(inventarioResponse.data)
            ? inventarioResponse.data
            : [];

          const listaSucursales = sucursalesConInventario.map((sucursal) => ({
            idSucursal: sucursal.idSucursal,
            nombre: sucursal.nombre,
          }));
          setSucursales(listaSucursales);

          const sucursalObjetivo =
            idSucursalFiltro ||
            sucursalSeleccionada ||
            listaSucursales[0]?.idSucursal ||
            null;

          if (!sucursalObjetivo) {
            setInventarios([]);
            return;
          }

          if (sucursalSeleccionada !== sucursalObjetivo) {
            setSucursalSeleccionada(sucursalObjetivo);
          }

          const dataSucursal = sucursalesConInventario.find(
            (sucursal) => sucursal.idSucursal === sucursalObjetivo,
          );

          setInventarios(
            Array.isArray(dataSucursal?.inventarios)
              ? dataSucursal.inventarios
              : [],
          );
          return;
        }

        notification.error({
          message: "No se pudo cargar el inventario",
          description:
            inventarioResponse?.error ||
            "Error al obtener productos de inventario.",
          duration: 4,
        });
        setInventarios([]);
      } catch {
        notification.error({
          message: "Error de conexión",
          description: "No se pudo cargar el inventario de productos.",
          duration: 4,
        });
        setInventarios([]);
      } finally {
        setLoading(false);
      }
    },
    [sucursalSeleccionada],
  );

  useEffect(() => {
    cargarInventario();
  }, [cargarInventario]);

  const handleCambiarSucursal = (value) => {
    setSucursalSeleccionada(value);
    cargarInventario(value);
  };

  const tableData = useMemo(() => {
    return inventarios.map((item) => ({
      ...item,
      productoNombre: item.producto?.nombre || "Sin informacion",
      productoCodigo: item.producto?.codigo || "Sin informacion",
      productoMarca: item.producto?.marca || "Sin informacion",
      bodegaNombre: item.bodega?.nombre || "Sin informacion",
      sucursalNombre: item.bodega?.sucursal?.nombre || "Sin informacion",
    }));
  }, [inventarios]);

  const filtros = useMemo(() => {
    const uniqueOptions = (field) => {
      return [...new Set(tableData.map((item) => item[field]).filter(Boolean))]
        .map((value) => String(value))
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    return [
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueOptions("estado"),
      },
      {
        key: "bodegaNombre",
        placeholder: "Bodega",
        options: uniqueOptions("bodegaNombre"),
      },
      {
        key: "sucursalNombre",
        placeholder: "Sucursal",
        options: uniqueOptions("sucursalNombre"),
      },
    ];
  }, [tableData]);

  const columns = [
    {
      title: "Codigo",
      dataIndex: "productoCodigo",
      key: "productoCodigo",
      width: 130,
    },
    {
      title: "Producto",
      dataIndex: "productoNombre",
      key: "productoNombre",
      width: 240,
    },
    {
      title: "Marca",
      dataIndex: "productoMarca",
      key: "productoMarca",
      width: 140,
    },
    {
      title: "Bodega",
      dataIndex: "bodegaNombre",
      key: "bodegaNombre",
      width: 160,
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 110,
      align: "center",
      render: (stock) => {
        const color = stock > 10 ? "success" : stock > 0 ? "warning" : "error";
        return <Badge status={color} text={stock ?? 0} />;
      },
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      width: 130,
      render: (estado) => (
        <Tag color={estadoColores[estado] || "default"}>
          {estado || "Sin informacion"}
        </Tag>
      ),
    },
    {
      title: "Detalle",
      key: "detalle",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setInventarioSeleccionado(record);
            setDrawerVisible(true);
          }}
        >
          Ver
        </Button>
      ),
    },
  ];

  const totalStock = tableData.reduce(
    (acc, item) => acc + (item.stock || 0),
    0,
  );
  const sinStock = tableData.filter((item) => (item.stock || 0) === 0).length;
  const bajoStock = tableData.filter(
    (item) =>
      (item.stock || 0) > 0 && (item.stock || 0) <= (item.stockMinimo || 0),
  ).length;

  const handleAbrirModalIngreso = async () => {
    await buscarTodosProductos(setProductos);
    await buscarTodasSucursales(setSucursalesDisponibles);
    if (sucursalSeleccionada) {
      formIngreso.setFieldsValue({ sucursal: sucursalSeleccionada });
      await buscarBodegasPorSucursal(sucursalSeleccionada, setBodegas);
    }
    setModalIngreso(true);
  };

  const handleCerrarModalIngreso = () => {
    formIngreso.resetFields();
    setBodegas([]);
    setSucursalesDisponibles([]);
    setProductos([]);
    //detalleIngreso([]);
    setModalIngreso(false);
  };

  const handleOnChangeSucursalIngreso = async (idSucursal) => {
    console.log("idsucursal:", idSucursal);
    formIngreso.setFieldsValue({ bodega: null });
    setBodegas([]);

    if (!idSucursal) return;

    await buscarBodegasPorSucursal(idSucursal, setBodegas);
  };

  //funciones tabla de modal ingreso manual
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
    const bodegaSeleccionada = bodegas.find(
      (b) => b.idBodega === values.bodega,
    );
    const sucursalSeleccionada = sucursalesDisponibles.find(
      (s) => s.idSucursal === values.sucursal,
    );
    console.log(
      "valores de tabla",
      productoSeleccionado.codigo,
      bodegaSeleccionada,
      sucursalSeleccionada,
    );
    if (
      detalleIngreso.some(
        (item) =>
          item.idProducto === values.producto &&
          item.idSucursal === values.sucursal &&
          item.idBodega === values.bodega,
      )
    ) {
      setDetalleIngreso((prev) =>
        prev.map((item) => {
          if (item.idProducto === values.producto) {
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
          "El producto seleccionado ya ha sido agregado al detalle. solo se edito la cantidad.",
        duration: 3,
      });
      return;
    }
    const nuevoDetalle = {
      key: crypto.randomUUID(),
      idProducto: values.producto,
      productoNombre: `${productoSeleccionado.nombre}`,
      cantidad: Number(values.cantidad),
      idBodega: values.bodega,
      bodegaNombre: `${bodegaSeleccionada.nombre}`,
      idSucursal: values.sucursal,
      sucursalNombre: ` ${sucursalSeleccionada.nombre}`,
    };

    setDetalleIngreso((prev) => [...prev, nuevoDetalle]);
    formIngreso.resetFields(["producto", "cantidad"]);
    //setBodegas([]);
  };

  const handleEditarCantidad = (key, nuevaCantidad) => {
    setDetalleIngreso((prev) =>
      prev.map((row) =>
        row.key === key ? { ...row, cantidad: nuevaCantidad } : row,
      ),
    );
  };

  const handleEliminarFila = (key) => {
    console.log("key eliminar:", key);
    setDetalleIngreso((prev) => prev.filter((row) => row.key !== key));
  };

  const columnsDetalle = [
    {
      title: "Producto",
      dataIndex: "productoNombre",
      key: "producto",
    },
    {
      title: "Sucursal",
      dataIndex: "sucursalNombre",
      key: "sucursal",
    },
    {
      title: "Bodega",
      dataIndex: "bodegaNombre",
      key: "bodega",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      width: 150,
      render: (value, record) => (
        <Input
          type="number"
          value={value}
          min={1}
          style={{ width: "100%" }}
          onChange={(e) =>
            handleEditarCantidad(record.key, Number(e.target.value))
          }
        />
      ),
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => handleEliminarFila(record.key)}
        />
      ),
    },
  ];

  //envio de productos manuales a backend
  const enviarIngresoManual = async () => {
    console.log("Productos", detalleIngreso);
    try {
      setLoading(true);
      const response = await ingresoManualProductos(detalleIngreso);
      console.log("datos recibidos ingreso manual", response);
      if (response?.status === 200) {
        notification.success({
          message: "Ingreso exitoso",
          description: "Los productos han sido ingresados correctamente.",
          duration: 4,
        });
        handleCerrarModalIngreso();
        cargarInventario(sucursalSeleccionada);
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
    handleCerrarModalIngreso();
  };

  return (
    <div style={{ padding: "24px" }}>
      <Spin spinning={loading} tip="Cargando..." fullscreen />
      <Card style={{ marginBottom: 20 }}>
        <Row justify="space-between" align="middle" gutter={[12, 12]}>
          <Col>
            <Space direction="vertical" size={0}>
              <Text strong style={{ fontSize: 15 }}>
                <ShopOutlined style={{ marginRight: 8 }} />
                Vista de inventario por sucursal
              </Text>
              <Text type="secondary">
                Selecciona una sucursal para consultar su inventario.
              </Text>
            </Space>
          </Col>
          <Col>
            <Space wrap>
              <Select
                style={{ minWidth: 280 }}
                value={sucursalSeleccionada}
                onChange={handleCambiarSucursal}
                options={[
                  ...sucursales.map((sucursal) => ({
                    value: sucursal.idSucursal,
                    label: `${sucursal.idSucursal} - ${sucursal.nombre}`,
                  })),
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => cargarInventario(sucursalSeleccionada)}
                loading={loading}
                disabled={!sucursalSeleccionada}
              >
                Recargar
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Productos en inventario"
              value={tableData.length}
              prefix={<InboxOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Stock total"
              value={totalStock}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Bajo stock / sin stock"
              value={`${bajoStock} / ${sinStock}`}
            />
          </Card>
        </Col>
      </Row>

      {tableData.length > 0 || loading ? (
        <DataTable
          data={tableData}
          columns={columns}
          rowKey="idInventario"
          loading={loading}
          searchPlaceholder="Buscar por producto, codigo o bodega"
          searchableFields={[
            "productoNombre",
            "productoCodigo",
            "productoMarca",
            "bodegaNombre",
          ]}
          filterConfig={filtros}
          headerButtons={
            <>
              <Button onClick={() => handleAbrirModalIngreso()}>
                Ingreso Productos
              </Button>
            </>
          }
        />
      ) : (
        <Empty description="No hay inventario disponible para la sucursal seleccionada" />
      )}
      {/* Drawer para mostrar detalles del inventario seleccionado */}
      <Drawer
        title="Detalle de Inventario"
        width={560}
        open={drawerVisible}
        onClose={() => {
          setDrawerVisible(false);
          setInventarioSeleccionado(null);
        }}
      >
        {inventarioSeleccionado && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="ID Inventario">
              {inventarioSeleccionado.idInventario}
            </Descriptions.Item>
            <Descriptions.Item label="Producto">
              {inventarioSeleccionado.productoNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Codigo">
              {inventarioSeleccionado.productoCodigo}
            </Descriptions.Item>
            <Descriptions.Item label="Marca">
              {inventarioSeleccionado.productoMarca}
            </Descriptions.Item>
            <Descriptions.Item label="Sucursal">
              {inventarioSeleccionado.sucursalNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Bodega">
              {inventarioSeleccionado.bodegaNombre}
            </Descriptions.Item>
            <Descriptions.Item label="Stock">
              {inventarioSeleccionado.stock ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock minimo">
              {inventarioSeleccionado.stockMinimo ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock maximo">
              {inventarioSeleccionado.stockMaximo ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Stock reservado">
              {inventarioSeleccionado.stockReservado ?? 0}
            </Descriptions.Item>
            <Descriptions.Item label="Estado">
              <Tag
                color={
                  estadoColores[inventarioSeleccionado.estado] || "default"
                }
              >
                {inventarioSeleccionado.estado || "Sin informacion"}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
      {/**Modal Ingreso manual */}
      <Modal
        title="Ingreso manual de productos"
        open={modalIngreso}
        onCancel={handleCerrarModalIngreso}
        okText="Confirmar Ingreso"
        onOk={() => {
          enviarIngresoManual();
        }}
        width={700}
      >
        <Form form={formIngreso} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Producto" name="producto">
                <Select placeholder="Selecciona un producto" allowClear>
                  {productos.map((producto) => (
                    <Select.Option
                      key={producto.idProducto}
                      value={producto.idProducto}
                    >
                      {`${producto.codigo} - ${producto.nombre} (${producto.marca})`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Cantidad" name="cantidad">
                <Input
                  type="number"
                  placeholder="Ingresa la cantidad a ingresar"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label="Sucursal" name="sucursal">
                <Select
                  placeholder="Selecciona una sucursal"
                  allowClear
                  onChange={handleOnChangeSucursalIngreso}
                >
                  {sucursalesDisponibles.map((sucursal) => (
                    <Select.Option
                      key={sucursal.idSucursal}
                      value={sucursal.idSucursal}
                    >
                      {`${sucursal.idSucursal} - ${sucursal.nombre}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Bodega" name="bodega">
                <Select
                  placeholder="Selecciona una bodega"
                  disabled={bodegas.length === 0}
                >
                  {bodegas.map((bodega) => (
                    <Select.Option
                      key={bodega.idBodega}
                      value={bodega.idBodega}
                    >
                      {`${bodega.idBodega} - ${bodega.nombre}`}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Button type="primary" onClick={handleAgregarDetalle}>
              Agregar
            </Button>
          </Form.Item>
        </Form>
        {detalleIngreso.length > 0 && (
          <DataTable
            data={detalleIngreso}
            columns={columnsDetalle}
            rowKey="key"
            showSearch={false}
            showFilters={false}
            pagination={false}
          />
        )}
      </Modal>
    </div>
  );
}
