import { useState, useEffect, useMemo } from "react";

import {
  Button,
  Descriptions,
  Divider,
  Modal,
  notification,
  Table,
  Tag,
  Typography,
  Form,
  Input,
  Tabs,
} from "antd";

import DataTable from "../../components/Tabla";

import { useParams } from "react-router-dom";

import {
  obtenerDespachosPorOrden,
  obtenerTodosDespachos,
  obtenerDespachosPorRutProveedor,
} from "../../services/inventario/Despacho.service";

export default function GestionDespachos() {
  const { nombreOrden } = useParams();
  const [form] = Form.useForm();
  const [formRutProveedor] = Form.useForm();
  const [despachosOc, setDespachosOc] = useState([]);
  const [todosDespachos, setTodoDespachos] = useState([]);
  const [todoDespachosRutProveedor, setTodoDespachosRutProveedor] = useState(
    [],
  );
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-CL");
  };

  // Filtros dinámicos basados en los datos
  const filtrosTodos = useMemo(() => {
    const uniqueOptions = (data, field) => {
      return [...new Set(data.map((item) => item[field]).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .map((value) => ({ value, label: value }));
    };

    return [
      {
        key: "tipoDocumento",
        placeholder: "Tipo Documento",
        options: uniqueOptions(todosDespachos, "tipoDocumento"),
      },
      {
        key: "tipoDespacho",
        placeholder: "Tipo Despacho",
        options: uniqueOptions(todosDespachos, "tipoDespacho"),
      },
      {
        key: "estado",
        placeholder: "Estado",
        options: uniqueOptions(todosDespachos, "estado"),
      },
    ];
  }, [todosDespachos]);

  // const normalizarNumeroOrdenCompra = (numeroOrden) => {
  //   if (!numeroOrden) return "";

  //   const valor = numeroOrden.toString().trim().toUpperCase();

  //   if (/^OC\d{9}$/.test(valor)) {
  //     return valor;
  //   }

  //   const correlativo = valor.replace(/\D/g, "");
  //   if (!correlativo) return "";

  //   const anioActual = new Date().getFullYear();
  //   return `OC${anioActual}${correlativo.padStart(5, "0")}`;
  // };

  const columnasDespachos = [
    {
      title: "Codigo",
      dataIndex: "codigoDespacho",
      key: "codigoDespacho",
    },
    {
      title: "Fecha",
      dataIndex: "fechaDespacho",
      key: "fechaDespacho",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Tipo Documento",
      dataIndex: "tipoDocumento",
      key: "tipoDocumento",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Tipo Despacho",
      dataIndex: "tipoDespacho",
      key: "tipoDespacho",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Nro Documento",
      dataIndex: "numeroDocumento",
      key: "numeroDocumento",
      render: (numero) => numero || "-",
    },
    {
      title: "Repartidor",
      dataIndex: "repartidor",
      key: "repartidor",
      render: (repartidor) => repartidor || "-",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        if (!estado) return "-";
        const color = estado.toLowerCase().includes("inventario")
          ? "green"
          : "blue";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
  ];

  const columnasDespachosRutProveedor = [
    {
      title: "Nombre OC",
      dataIndex: ["ordencompra", "nombreOrden"],
      key: "nombreOrden",
      render: (nombreOrden) => nombreOrden || "-",
    },
    {
      title: "Codigo",
      dataIndex: "codigoDespacho",
      key: "codigoDespacho",
    },
    {
      title: "Fecha",
      dataIndex: "fechaDespacho",
      key: "fechaDespacho",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Tipo Documento",
      dataIndex: "tipoDocumento",
      key: "tipoDocumento",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Tipo Despacho",
      dataIndex: "tipoDespacho",
      key: "tipoDespacho",
      render: (tipo) => tipo || "-",
    },
    {
      title: "Nro Documento",
      dataIndex: "numeroDocumento",
      key: "numeroDocumento",
      render: (numero) => numero || "-",
    },
    {
      title: "Repartidor",
      dataIndex: "repartidor",
      key: "repartidor",
      render: (repartidor) => repartidor || "-",
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => {
        if (!estado) return "-";
        const color = estado.toLowerCase().includes("inventario")
          ? "green"
          : "blue";
        return <Tag color={color}>{estado}</Tag>;
      },
    },
  ];

  const columnasDetalleDespacho = [
    {
      title: "Codigo Detalle",
      dataIndex: "codigoDetalleDespacho",
      key: "codigoDetalleDespacho",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Recibida",
      dataIndex: "cantidadRecibida",
      key: "cantidadRecibida",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Rechazada",
      dataIndex: "cantidadRechazada",
      key: "cantidadRechazada",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Observaciones",
      dataIndex: "observaciones",
      key: "observaciones",
      render: (observaciones) => observaciones || "-",
    },
  ];

  const columnasLotes = [
    {
      title: "Codigo Lote",
      dataIndex: "codigoLote",
      key: "codigoLote",
      render: (codigo) => codigo || "-",
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      render: (cantidad) => cantidad ?? 0,
    },
    {
      title: "Estado",
      dataIndex: "estado",
      key: "estado",
      render: (estado) => estado || "-",
    },
    {
      title: "Fecha Vencimiento",
      dataIndex: "fechaVencimiento",
      key: "fechaVencimiento",
      render: (fecha) => formatearFecha(fecha),
    },
    {
      title: "Codigo Producto",
      key: "codigoProducto",
      render: (_, lote) => lote.producto?.codigo || "-",
    },
    {
      title: "Nombre Producto",
      key: "nombreProducto",
      render: (_, lote) => lote.producto?.nombre || "-",
    },
    {
      title: "Precio Venta",
      key: "precioVentaProducto",
      render: (_, lote) => {
        const precio = lote.producto?.precioVenta;
        if (precio === null || precio === undefined || precio === "")
          return "-";
        return `$${Number(precio).toLocaleString("es-CL")}`;
      },
    },
    {
      title: "ID Producto",
      dataIndex: "idProducto",
      key: "idProducto",
      render: (idProducto) => idProducto || "-",
    },
    {
      title: "ID Bodega",
      dataIndex: "idBodega",
      key: "idBodega",
      render: (idBodega) => idBodega || "-",
    },
  ];

  const handleAbrirDetalle = (despacho) => {
    setDespachoSeleccionado(despacho);
    setModalDetalleAbierto(true);
  };

  const handleCerrarDetalle = () => {
    setModalDetalleAbierto(false);
    setDespachoSeleccionado(null);
  };

  const handleBuscarDespachosOC = async (values) => {
    const numeroOrden = values.numeroOrden?.toString().trim();
    console.log("numero orden", numeroOrden);
    // const numeroOrdenNormalizado = normalizarNumeroOrdenCompra(numeroOrden);

    // if (!numeroOrdenNormalizado) {
    //   notification.warning({
    //     message: "Busqueda incompleta",
    //     description: "Ingresa numero de orden",
    //   });
    //   return;
    // }

    const payload = {};

    // if (numeroOrdenNormalizado) {
    //   payload.numeroOrden = numeroOrdenNormalizado;
    // }

    try {
      console.log("Payload de busqueda de despachos:", payload);
      const respuesta = await obtenerDespachosPorOrden(numeroOrden);
      console.log("Respuesta de despacho por orden", respuesta.data);
      if (respuesta.status === 200) {
        setDespachosOc(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description:
          "No se pudieron obtener los despachos para esta orden, verifica el numero ingresado.",
      });
      // Se mantiene el comportamiento actual para busqueda por numero de orden.
    } catch (error) {
      console.error("Error al buscar despachos:", error);
      notification.error({
        message: "Error",
        description:
          "No se pudieron buscar despachos con los filtros ingresados.",
      });
    }
  };

  const handleBuscarDespachosRutProveedor = async (values) => {
    const rutProveedor = values.rutProveedor?.trim();

    if (!rutProveedor) {
      notification.warning({
        message: "Busqueda incompleta",
        description: "Ingresa RUT proveedor.",
      });
      return;
    }

    try {
      console.log("Payload de busqueda de despachos:", rutProveedor);
      const respuesta = await obtenerDespachosPorRutProveedor(rutProveedor);
      console.log("Respuesta de despacho por RUT proveedor", respuesta.data);
      if (respuesta.status === 200) {
        setTodoDespachosRutProveedor(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description:
          "No se pudieron obtener los despachos para este RUT de proveedor, verifica el RUT ingresado.",
      });

      // Se mantiene el comportamiento actual para busqueda por numero de orden.
    } catch (error) {
      console.error("Error al buscar despachos:", error);
      notification.error({
        message: "Error",
        description:
          "No se pudieron buscar despachos con los filtros ingresados.",
      });
    }
  };

  const handleBuscarTodosDespachos = async () => {
    try {
      const respuesta = await obtenerTodosDespachos();
      console.log("Respuesta de todos los despachos", respuesta.data);
      if (respuesta.status === 200) {
        setTodoDespachos(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description: "No se pudieron obtener todos los despachos.",
      });
    } catch (error) {
      console.error("Error al buscar todos los despachos:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron obtener todos los despachos.",
      });
    }
  };

  useEffect(() => {
    if (nombreOrden) {
      form.setFieldValue("numeroOrden", nombreOrden.slice(6));
      form.submit();
    }
  }, [nombreOrden, form]);

  return (
    <div>
      <Typography.Title>Gestion De Despachos</Typography.Title>

      <Tabs
        onChange={(key) => {
          console.log("Tab activo:", key);
          if (key === "todos") {
            console.log("todos");
            handleBuscarTodosDespachos();
          }
        }}
        items={[
          {
            key: "buscar",
            label: "Buscar Despachos por OC",
            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Buscar Despachos por Orden de Compra
                </Typography.Title>
                <Form
                  form={form}
                  layout="inline"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                  onFinish={handleBuscarDespachosOC}
                >
                  <Form.Item
                    label="Numero de orden"
                    name="numeroOrden"
                    style={{ marginBottom: 0 }}
                    // rules={
                    //   [
                    //     // {
                    //     //   pattern: /^\d*$/,
                    //     //   message: "El numero de orden debe ser numerico",
                    //     // },
                    //   ]
                    // }
                  >
                    <Input
                      placeholder={`OC${new Date().getFullYear()}12345641`}
                      style={{ width: 220 }}
                      maxLength={14}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit">
                      Buscar
                    </Button>
                  </Form.Item>
                </Form>
                {despachosOc.length > 0 && (
                  <DataTable
                    data={despachosOc}
                    columns={columnasDespachos}
                    rowKey="idDespacho"
                    searchableFields={[
                      "codigoDespacho",
                      "tipoDocumento",
                      "repartidor",
                    ]}
                    filterConfig={filtrosTodos}
                    showFilters={true}
                    searchPlaceholder="Buscar por codigo"
                    onRowClick={handleAbrirDetalle}
                  />
                )}
              </>
            ),
          },
          {
            key: "busqueda_rutProveedor",
            label: "Buscar Despachos por RUT Proveedor",
            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Buscar Despachos por RUT del Proveedor
                </Typography.Title>
                <Form
                  form={formRutProveedor}
                  layout="inline"
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                  onFinish={handleBuscarDespachosRutProveedor}
                >
                  <Form.Item
                    label="RUT proveedor"
                    name="rutProveedor"
                    style={{ marginBottom: 0 }}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const rutRegex = /^\d{7,8}-[\dkK]$/;
                          if (!rutRegex.test(value)) {
                            return Promise.reject(
                              new Error("El RUT debe tener formato XXXXXXXX-X"),
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input
                      placeholder="Ingrese RUT del proveedor"
                      style={{ width: 220 }}
                      maxLength={10}
                      onChange={(e) => {
                        // Permite solo números, guión y K
                        const valor = e.target.value.replace(/[^0-9kK-]/g, "");
                        e.target.value = valor;
                      }}
                    />
                  </Form.Item>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="primary" htmlType="submit">
                      Buscar
                    </Button>
                  </Form.Item>
                </Form>

                {todoDespachosRutProveedor.length > 0 && (
                  <DataTable
                    data={todoDespachosRutProveedor}
                    columns={columnasDespachosRutProveedor}
                    rowKey="idDespacho"
                    searchableFields={["codigoDespacho", "nombreOrden"]}
                    showFilters={false}
                    searchPlaceholder="Buscar Codigo Despacho"
                    onRowClick={handleAbrirDetalle}
                  />
                )}
              </>
            ),
          },
          {
            key: "todos",
            label: "Ver Todos los Despachos",

            children: (
              <>
                <Typography.Title level={4} style={{ marginTop: 20 }}>
                  Todos los Despachos
                </Typography.Title>
                <DataTable
                  data={todosDespachos}
                  columns={columnasDespachos}
                  rowKey="idDespacho"
                  searchableFields={[
                    "codigoDespacho",
                    "tipoDocumento",
                    "repartidor",
                  ]}
                  filterConfig={filtrosTodos}
                  showFilters={true}
                  searchPlaceholder="Buscar por codigo"
                  onRowClick={handleAbrirDetalle}
                />
              </>
            ),
          },
        ]}
      />

      {/**Modal Detalles */}
      <Modal
        title="Detalle del despacho"
        open={modalDetalleAbierto}
        width={900}
        onCancel={handleCerrarDetalle}
        footer={[
          <Button key="cerrar" onClick={handleCerrarDetalle}>
            Cerrar
          </Button>,
        ]}
      >
        {despachoSeleccionado && (
          <>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Codigo Despacho">
                {despachoSeleccionado.codigoDespacho || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Fecha Despacho">
                {formatearFecha(despachoSeleccionado.fechaDespacho)}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Documento">
                {despachoSeleccionado.tipoDocumento || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Tipo Despacho">
                {despachoSeleccionado.tipoDespacho || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Numero Documento">
                {despachoSeleccionado.numeroDocumento || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Repartidor">
                {despachoSeleccionado.repartidor || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Proveedor">
                {despachoSeleccionado.ordencompra?.creaOrdenCompra?.proveedor
                  ?.nombre || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Rut Proveedor">
                {despachoSeleccionado.ordencompra?.creaOrdenCompra?.proveedor
                  ?.rut || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Estado">
                {despachoSeleccionado.estado || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Observaciones" span={2}>
                {despachoSeleccionado.observaciones || "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider style={{ margin: "16px 0" }} />

            <Typography.Text strong>
              Detalles del despacho (
              {despachoSeleccionado.detalledespachos?.length || 0})
            </Typography.Text>

            <Table
              size="small"
              dataSource={despachoSeleccionado.detalledespachos || []}
              columns={columnasDetalleDespacho}
              rowKey={(detalle, index) =>
                `${detalle.idDetalledespacho || "detalle"}-${index}`
              }
              pagination={false}
              expandable={{
                expandedRowRender: (detalle) => (
                  <Table
                    size="small"
                    dataSource={detalle.lotes || []}
                    columns={columnasLotes}
                    rowKey={(lote, index) =>
                      `${lote.idLote || "lote"}-${index}`
                    }
                    pagination={false}
                    locale={{ emptyText: "Sin lotes asociados" }}
                  />
                ),
                rowExpandable: (detalle) =>
                  Array.isArray(detalle.lotes) && detalle.lotes.length > 0,
              }}
              locale={{ emptyText: "No hay detalles para este despacho" }}
            />
          </>
        )}
      </Modal>
    </div>
  );
}
