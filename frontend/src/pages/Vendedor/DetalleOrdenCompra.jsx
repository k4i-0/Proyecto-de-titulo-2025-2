import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  notification,
  Card,
  Descriptions,
  Typography,
  Tag,
  Table,
  Row,
  Col,
  Divider,
  Button,
  Form,
} from "antd";

import { obtenerOrdenCompraVendedorPorNombreOrden } from "../../services/inventario/CompraProveedor.service";
import obtenerSucursales from "../../services/inventario/Sucursal.service";
import { obtenerBodegasPorSucursal } from "../../services/inventario/Bodega.service";
import { crearOrdenCompraSucursalVendedor } from "../../services/inventario/CompraProveedor.service";

import ModalRecepcionDespachos from "../../components/ModalRecepcionDespachos";
import DrawerDetalleDespachos from "../../components/drawerdetalleDespachos";

const { Title } = Typography;

const buscarOrdenCompra = async (nombreOrden, state) => {
  try {
    const response =
      await obtenerOrdenCompraVendedorPorNombreOrden(nombreOrden);
    console.log("Orden de compra obtenida:", response.data);
    if (response.status === 200) {
      state(response.data);
      notification.success({
        message: "Éxito",
        description: "Orden de compra obtenida correctamente",
      });
      return;
    }
    notification.error({
      message: "Error",
      description: "No se pudo obtener la orden de compra",
    });
    return;
  } catch (error) {
    console.error("Error al obtener la orden de compra:", error);
    notification.error({
      message: "Error",
      description: "Error al obtener la orden de compra",
    });
    return;
  }
};

const buscarSucursales = async (state) => {
  try {
    const respuesta = await obtenerSucursales();
    if (respuesta.status === 200) {
      const sucursales = Array.isArray(respuesta.data)
        ? respuesta.data
        : respuesta.data?.sucursales || [];
      state(sucursales);
      notification.success({
        message: "Éxito",
        description: "Sucursales encontradas",
      });
      return;
    }
    if (respuesta.status === 204) {
      state([]);
      notification.info({
        message: "Información",
        description: "No se encontraron sucursales",
      });
      return;
    }
    notification.error({
      message: "Error",
      description: respuesta.error || "Error al buscar las sucursales",
    });
  } catch (error) {
    console.log("Error", error);
    notification.error({
      message: "Error",
      description: "Error al buscar las sucursales",
    });
  }
};

const buscarBodegas = async (idSucursal, state) => {
  try {
    const respuesta = await obtenerBodegasPorSucursal(idSucursal);
    console.log("Respuesta de bodegas", respuesta);
    if (respuesta.status === 200) {
      state(respuesta.data);
      notification.success({
        message: "Éxito",
        description: "Bodegas encontradas",
      });
      return;
    }
    notification.error({
      message: "Error",
      description: respuesta.error || "Error al buscar las bodegas",
    });
    state([]);
  } catch (error) {
    console.log("Error", error);
    notification.error({
      message: "Error",
      description: "Error al buscar las bodegas",
    });
  }
};

export default function DetalleOrdenCompra() {
  const datosUrl = useParams();
  const [ordenCompra, setOrdenCompra] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [bodegas, setBodegas] = useState([]);

  const [modalRecepcionAbierto, setModalRecepcionAbierto] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const [drawerDespachos, setDrawerDespachos] = useState(false);

  const [formRecepcion] = Form.useForm();
  const idSucursalSeleccionada = Form.useWatch("idSucursal", formRecepcion);

  const handleCerrarRecepcion = () => {
    setModalRecepcionAbierto(false);
    formRecepcion.resetFields();
  };

  const handleConfirmarRecepcion = async (values) => {
    setModalLoading(true);
    const payloadRecepcion = {
      idOrdenCompra: ordenCompra?.ordencompra?.idOrdenCompra,
      idProveedor: ordenCompra?.idProveedor,
      tipoDocumento: values.tipoDocumento,
      tipoDespacho: values.tipoDespacho,
      numeroDocumento: values.numeroDocumento,
      repartidor: values.repartidor,
      observaciones: values.observacionesRecepcion,
      idSucursal: values.idSucursal,
      idBodega: values.idBodega,
      productos: (values.detalles || []).map((detalle) => ({
        idProducto: detalle.idProducto,
        productoCodigo: detalle.productoCodigo,
        cantidadSolicitada: Number(detalle.cantidadSolicitada) || 0,
        cantidadRecibida: Number(detalle.cantidadRecibida) || 0,
        cantidadRechazada: Number(detalle.cantidadRechazada) || 0,
      })),
    };

    console.log("Payload recepción:", payloadRecepcion);
    try {
      const respuesta =
        await crearOrdenCompraSucursalVendedor(payloadRecepcion);
      if (respuesta.status === 200) {
        notification.success({
          message: "Recepción registrada",
          description: "La recepción del despacho fue preparada correctamente.",
        });
        handleCerrarRecepcion();
        setModalLoading(false);
        return;
      }
      notification.error({
        message: "Error",
        description:
          respuesta.error || "Error al registrar la recepción del despacho",
      });
      setModalLoading(false);
      return;
    } catch (error) {
      console.error("Error al crear la recepción del despacho:", error);
      notification.error({
        message: "Error",
        description: "Error al registrar la recepción del despacho",
      });
      setModalLoading(false);
      return;
    }
  };

  const handleAbrirModalRecepcion = () => {
    // Inicializar valores del formulario con los detalles de la orden
    if (ordenCompra) {
      formRecepcion.resetFields();

      const despachos = ordenCompra?.ordencompra?.despachos || [];

      const detallesIniciales =
        ordenCompra?.ordencompra?.compraproveedordetalles?.map(
          (detalle, index) => {
            const detalleDespachoPorProducto = despachos.reduce(
              (acumulador, despacho) => {
                const detalleDespacho = despacho?.detalledespachos?.[index];

                if (!detalleDespacho) return acumulador;

                return {
                  cantidadRecibida:
                    acumulador.cantidadRecibida +
                    (Number(
                      detalleDespacho.cantidadRecibida ??
                        detalleDespacho.cantidad,
                    ) || 0),
                  cantidadRechazada:
                    acumulador.cantidadRechazada +
                    (Number(detalleDespacho.cantidadRechazada) || 0),
                };
              },
              { cantidadRecibida: 0, cantidadRechazada: 0 },
            );

            return {
              idProducto: detalle.producto?.idProducto,
              productoNombre: detalle.producto?.nombre || "",
              productoCodigo: detalle.producto?.codigo || "",
              cantidadSolicitada: Number(detalle.cantidad) || 0,
              cantidadRecibida: detalleDespachoPorProducto.cantidadRecibida,
              cantidadRechazada: detalleDespachoPorProducto.cantidadRechazada,
            };
          },
        ) || [];

      formRecepcion.setFieldsValue({
        tipoDocumento: undefined,
        tipoDespacho: undefined,
        numeroDocumento: "",
        repartidor: "",
        idSucursal: ordenCompra?.sucursal?.idSucursal,
        observacionesRecepcion: "",
        detalles: detallesIniciales,
      });
    }

    setModalRecepcionAbierto(true);
  };

  const handleAbrirDrawerDespachos = () => {
    console.log("Orden Compra", ordenCompra?.ordencompra);
    setDrawerDespachos(true);
  };

  const handleCerrarDrawerDespachos = () => {
    setDrawerDespachos(false);
  };

  useEffect(() => {
    buscarOrdenCompra(datosUrl.nombreOrden, setOrdenCompra);
    buscarSucursales(setSucursales);
  }, [datosUrl.nombreOrden]);

  useEffect(() => {
    if (!modalRecepcionAbierto) return;

    if (!idSucursalSeleccionada) {
      setBodegas([]);
      return;
    }

    buscarBodegas(idSucursalSeleccionada, setBodegas);
  }, [idSucursalSeleccionada, modalRecepcionAbierto]);

  return (
    <>
      {ordenCompra ? (
        <Card
          title={
            <Title level={3}>
              Detalle orden de compra: {ordenCompra.ordencompra.nombreOrden}
            </Title>
          }
          style={{
            width: 1000,
            margin: 20,
            marginLeft: "auto",
            marginRight: "auto",
          }}
          extra={
            <>
              <Button
                disabled={
                  !["recepcionada", "recibida con faltante"].includes(
                    ordenCompra?.ordencompra?.estado,
                  )
                }
                variant="solid"
                color="green"
                onClick={() => handleAbrirModalRecepcion()}
              >
                Recepcionar
              </Button>
              <Button
                disabled={
                  !["recepcionada", "recibida con faltante"].includes(
                    ordenCompra?.ordencompra?.estado,
                  )
                }
                variant="outline"
                onClick={() => handleAbrirDrawerDespachos()}
              >
                Despachos
              </Button>
            </>
          }
        >
          {/* Orden de compra */}
          <Title level={5} style={{ margin: 10 }}>
            Detalles orden de compra
          </Title>
          <Row>
            <Col span={24}>
              <Descriptions
                bordered
                column={3}
                size="small"
                style={{ margin: 0 }}
              >
                <Descriptions.Item label="N° Orden" span={2}>
                  {ordenCompra?.ordencompra?.nombreOrden || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  <Tag color="blue">
                    {ordenCompra?.ordencompra?.estado || "-"}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Fecha creación">
                  {new Date(ordenCompra?.createdAt).toLocaleDateString("es-CL")}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha autorización">
                  {ordenCompra?.fechaAutorizacion
                    ? new Date(
                        ordenCompra.fechaAutorizacion,
                      ).toLocaleDateString("es-CL")
                    : "Sin autorización"}
                </Descriptions.Item>
                <Descriptions.Item label="Sucursal">
                  {ordenCompra?.sucursal?.nombre || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Dirección">
                  {ordenCompra?.sucursal?.direccion || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Divider />

          {/* Proveedor */}
          <Title level={5} style={{ margin: 10 }}>
            Detalle Proveedor
          </Title>
          <Row justify={"center"} align={"middle"}>
            <Col span={24}>
              <Descriptions
                bordered
                column={2}
                size="small"
                style={{ margin: 0, paddin: 0 }}
              >
                <Descriptions.Item label="Nombre">
                  {ordenCompra?.proveedor?.nombre || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="RUT">
                  {ordenCompra?.proveedor?.rut || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {ordenCompra?.proveedor?.email || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Teléfono">
                  {ordenCompra?.proveedor?.telefono || "-"}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Divider />

          {/* Funcionarios */}
          <Title level={5} style={{ margin: 10 }}>
            Detalle Funcionarios
          </Title>
          <Row justify={"center"} align={"middle"}>
            <Col span={24}>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Solicita">
                  {ordenCompra?.vendedor?.nombre || "Sin información"}
                </Descriptions.Item>
                <Descriptions.Item label="RUT solicitante">
                  {ordenCompra?.vendedor?.rut || "Sin información"}
                </Descriptions.Item>
                <Descriptions.Item label="Autoriza">
                  {ordenCompra?.administrador?.nombre || "Sin información"}
                </Descriptions.Item>
                <Descriptions.Item label="RUT autorizante">
                  {ordenCompra?.administrador?.rut || "Sin información"}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
          <Divider />
          <Title level={5} style={{ margin: 10 }}>
            Detalle productos
          </Title>
          <Row justify={"center"} align={"middle"} style={{ marginTop: 20 }}>
            <Col span={24}>
              <Table
                dataSource={ordenCompra?.ordencompra?.compraproveedordetalles}
                rowKey={(_, index) => index}
                pagination={false}
                size="small"
                bordered
                columns={[
                  {
                    title: "Producto",
                    dataIndex: ["producto", "nombre"],
                    key: "nombre",
                    render: (nombre) => nombre || "Sin información",
                  },
                  {
                    title: "Cantidad",
                    dataIndex: "cantidad",
                    key: "cantidad",
                    align: "center",
                  },
                  {
                    title: "Precio unitario",
                    dataIndex: "precioUnitario",
                    key: "precioUnitario",
                    align: "right",
                    render: (precio) =>
                      `$${Number(precio).toLocaleString("es-CL")}`,
                  },
                  {
                    title: "Subtotal",
                    key: "subtotal",
                    align: "right",
                    render: (_, record) =>
                      `$${Number(record.cantidad * record.precioUnitario).toLocaleString("es-CL")}`,
                  },
                ]}
                summary={(data) => {
                  const total = data.reduce(
                    (acc, d) => acc + d.cantidad * d.precioUnitario,
                    0,
                  );
                  return (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong>
                          ${Number(total).toLocaleString("es-CL")}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  );
                }}
              />
            </Col>
          </Row>
        </Card>
      ) : (
        <h1>Cargando detalles de la orden de compra...</h1>
      )}

      <ModalRecepcionDespachos
        open={modalRecepcionAbierto}
        onCancel={handleCerrarRecepcion}
        ordenSeleccionada={ordenCompra}
        sucursales={sucursales}
        bodegas={bodegas}
        form={formRecepcion}
        onFinish={handleConfirmarRecepcion}
        loading={modalLoading}
      />

      <DrawerDetalleDespachos
        open={drawerDespachos}
        onClose={handleCerrarDrawerDespachos}
        ordenDrawer={ordenCompra?.ordencompra}
      />
    </>
  );
}
