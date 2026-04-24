import { useState, useEffect } from "react";

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
} from "antd";

import DataTable from "../../components/Tabla";

import { useParams } from "react-router-dom";

import { obtenerDespachosPorOrden } from "../../services/inventario/Despacho.service";

export default function GestionDespachos() {
  const { idOrdenCompra } = useParams();
  const [form] = Form.useForm();
  const [despachos, setDespachos] = useState([]);
  const [bandera, setBandera] = useState(false);
  const [despachoSeleccionado, setDespachoSeleccionado] = useState(null);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleString("es-CL");
  };

  const validarFormatoRut = (rut) => {
    if (!rut) return true;
    const regexRut = /^\d{8}-[\dKk]$/;
    return regexRut.test(rut.trim());
  };

  const normalizarNumeroOrdenCompra = (numeroOrden) => {
    if (!numeroOrden) return "";

    const valor = numeroOrden.toString().trim().toUpperCase();

    if (/^OC\d{9}$/.test(valor)) {
      return valor;
    }

    const correlativo = valor.replace(/\D/g, "");
    if (!correlativo) return "";

    const anioActual = new Date().getFullYear();
    return `OC${anioActual}${correlativo.padStart(5, "0")}`;
  };

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

  const handleBuscarDespachos = async (values) => {
    const numeroOrden = values.numeroOrden?.toString().trim();
    const rutProveedor = values.rutProveedor?.trim();
    const numeroOrdenNormalizado = normalizarNumeroOrdenCompra(numeroOrden);

    if (!numeroOrdenNormalizado && !rutProveedor) {
      notification.warning({
        message: "Busqueda incompleta",
        description: "Ingresa numero de orden, RUT proveedor o ambos.",
      });
      return;
    }

    const payload = {};

    if (numeroOrdenNormalizado) {
      payload.numeroOrden = numeroOrdenNormalizado;
    }

    if (rutProveedor) {
      payload.rutProveedor = rutProveedor;
    }

    try {
      // TODO: Conectar este payload con el servicio de backend.
      // Ejemplo:
      // const respuesta = await buscarDespachos(payload);
      console.log("Payload de busqueda de despachos:", payload);

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

  const obtenerDespachos = async (idOrdenCompra) => {
    try {
      const respuesta = await obtenerDespachosPorOrden(idOrdenCompra);
      console.log("Respuesta de despacho", respuesta);
      if (respuesta.status === 200) {
        setBandera(true);
        setDespachos(respuesta.data);
        return;
      }
      notification.error({
        message: "Error",
        description: "No se pudieron obtener los despachos para esta orden",
      });
    } catch (error) {
      console.log("Error al obtener despachos por orden:", error);
      notification.error({
        message: "Error",
        description: "No se pudieron obtener los despachos para esta orden",
      });
    }
  };

  useEffect(() => {
    if (idOrdenCompra) {
      obtenerDespachos(idOrdenCompra);
    }
  }, [idOrdenCompra]);

  return (
    <div>
      <Typography.Title>Gestion De Despachos</Typography.Title>

      {bandera ? (
        <DataTable
          data={despachos}
          columns={columnasDespachos}
          rowKey="idDespacho"
          searchableFields={[
            "codigoDespacho",
            "tipoDocumento",
            "tipoDespacho",
            "numeroDocumento",
            "repartidor",
            "estado",
            "observaciones",
          ]}
          showFilters={false}
          searchPlaceholder="Buscar por codigo, estado o repartidor"
          onRowClick={handleAbrirDetalle}
        />
      ) : (
        <>
          <Typography.Title level={4} style={{ marginTop: 20 }}>
            Buscar Despachos
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
            onFinish={handleBuscarDespachos}
          >
            <Form.Item
              label="Numero de orden"
              name="numeroOrden"
              style={{ marginBottom: 0 }}
              rules={[
                {
                  pattern: /^\d*$/,
                  message: "El numero de orden debe ser numerico",
                },
              ]}
            >
              <Input
                addonBefore={`OC-${new Date().getFullYear()}-`}
                placeholder="Ingrese numero de orden"
                style={{ width: 220 }}
                maxLength={8}
              />
            </Form.Item>

            <Form.Item
              label="RUT proveedor"
              name="rutProveedor"
              style={{ marginBottom: 0 }}
              rules={[
                {
                  validator: (_, value) =>
                    !value || validarFormatoRut(value)
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error("El RUT debe tener formato XXXXXXXX-X"),
                        ),
                },
              ]}
            >
              <Input
                placeholder="Ingrese RUT del proveedor"
                style={{ width: 220 }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button type="primary" htmlType="submit">
                Buscar
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

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
              <Descriptions.Item label="ID Despacho">
                {despachoSeleccionado.idDespacho || "-"}
              </Descriptions.Item>
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
              <Descriptions.Item label="Estado">
                {despachoSeleccionado.estado || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="ID Orden Compra">
                {despachoSeleccionado.idOrdenCompra || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Creado">
                {formatearFecha(despachoSeleccionado.createdAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Actualizado" span={2}>
                {formatearFecha(despachoSeleccionado.updatedAt)}
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
              style={{ marginTop: 8 }}
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
