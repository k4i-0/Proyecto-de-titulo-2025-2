import { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Tag,
  Modal,
  Form,
  Descriptions,
  Input,
  Button,
  Row,
  Col,
  notification,
  Tabs,
  Select,
  Space,
} from "antd";

import DataTable from "../../../components/Tabla";
import { buscarProductosCategoriaYDescuentos } from "../../../services/functions/Descuentos";
import { buscarCategorias } from "../../../services/functions/Categorias";
import {
  registrarDescuentoSobreProducto,
  buscarDescuentoProducto,
  cambiarEstadoDescuento,
  buscarDescuentoCategoria,
  crearDescuentoCategoria,
} from "../../../services/ventas/descuento.service";

export default function GestionDescuentos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [descuentoProducto, setDescuentoProducto] = useState([]);
  const [descuentoBuscadosCategoria, setDescuentoBuscadosCategoria] = useState(
    [],
  );
  const [modalDescuentoProducto, setModalDescuentoProducto] = useState(false);
  const [modalDescuentoCategoria, setModalDescuentoCategoria] = useState(false);

  const [formDescuentoProducto] = Form.useForm();
  const [formDescuentoCategoria] = Form.useForm();

  const valorPorcentaje = Form.useWatch(
    "porcentajeDescuento",
    formDescuentoProducto,
  );
  const valorMonto = Form.useWatch("montoDescuento", formDescuentoProducto);

  const traerProductos = async () =>
    buscarProductosCategoriaYDescuentos(setProductos);

  useEffect(() => {
    traerProductos();
  }, []);

  //calular descuento
  const calcularMontoDescuento = (arregloDescuentos, precioVenta) => {
    if (!arregloDescuentos || arregloDescuentos.length === 0) return 0;

    return arregloDescuentos.reduce((total, item) => {
      const objDescuento = item.descuento;
      if (!objDescuento) return total;

      const valorPorcentaje = Number(objDescuento.porcentajeDescuento || 0);
      const valorMonto = Number(objDescuento.montoDescuento || 0);

      if (valorPorcentaje > 0) {
        return total + precioVenta * (valorPorcentaje / 100);
      } else if (valorMonto > 0) {
        return total + valorMonto;
      }
      return total;
    }, 0);
  };
  //da formato a columnas de precio y descuento para mostrar en la tabla
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value || 0);

  //busca y define categorias únicas para el filtro de la tabla
  const categoriaOptions = useMemo(() => {
    const categoriasMap = new Map();
    productos.forEach((producto) => {
      if (producto.categoria && producto.idCategoria) {
        if (!categoriasMap.has(producto.idCategoria)) {
          categoriasMap.set(producto.idCategoria, {
            value: producto.idCategoria,
            label: producto.categoria.nombreCategoria,
          });
        }
      }
    });
    return Array.from(categoriasMap.values());
  }, [productos]);

  const columns = [
    {
      title: "ID",
      dataIndex: "idProducto",
      key: "idProducto",
      width: 80,
      align: "center",
    },
    {
      title: "Código",
      dataIndex: "codigo",
      key: "codigo",
      width: 140,
    },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
    },
    {
      title: "Categoría",
      dataIndex: ["categoria", "nombreCategoria"],
      key: "categoria",
      render: (categoria) =>
        categoria ? (
          <Tag color="blue">{categoria}</Tag>
        ) : (
          <Typography.Text type="secondary">Sin categoría</Typography.Text>
        ),
    },
    {
      title: "Precio",
      dataIndex: "precioVenta",
      key: "precioVenta",
      align: "right",
      render: (precio) => (
        <Typography.Text strong>{formatCurrency(precio)}</Typography.Text>
      ),
    },
    {
      title: "Descuentos Aplicados",
      key: "descuentos_combinados",
      align: "right",
      render: (_, record) => {
        // 1. Calcular descuento por producto (Directo)
        const descProducto = calcularMontoDescuento(
          record.descuentosobres,
          record.precioVenta,
        );

        // 2. Calcular descuento por categoría (Heredado)
        const descCategoria = calcularMontoDescuento(
          record.categoria?.descuentosobres,
          record.precioVenta,
        );

        // Si ambos son cero, no hay promociones aplicadas
        if (descProducto === 0 && descCategoria === 0) {
          return (
            <Typography.Text type="secondary">Sin descuento</Typography.Text>
          );
        }

        return (
          <Space
            direction="vertical"
            size="mini"
            style={{ alignItems: "flex-end" }}
          >
            {/* Si tiene descuento propio del producto, se muestra en verde */}
            {descProducto > 0 && (
              <Tag color="green" style={{ margin: 0 }}>
                Prod: -{formatCurrency(descProducto)}
              </Tag>
            )}

            {/* Si tiene descuento heredado de la categoría, se muestra en morado */}
            {descCategoria > 0 && (
              <Tag color="purple" style={{ margin: 0 }}>
                Cat: -{formatCurrency(descCategoria)}
              </Tag>
            )}

            {/* Opcional: Si quieres mostrar el total final sumado en negrita */}
            {descProducto > 0 && descCategoria > 0 && (
              <Typography.Text size="small" type="success" strong>
                Total: -{formatCurrency(descProducto + descCategoria)}
              </Typography.Text>
            )}
          </Space>
        );
      },
    },
  ];

  const columnsDescuentos = [
    {
      title: "ID",
      dataIndex: "idDescuentoSobre",
      key: "idDescuentoSobre",
      align: "center",
      width: 70,
    },
    {
      title: "Aplica A", // 👈 Cambiamos el título a algo más genérico
      key: "aplicaA",
      width: 220,
      render: (_, record) => {
        // Caso 1: Es un descuento heredado de una Categoría
        if (record.categoria) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography.Text strong style={{ color: "#722ed1" }}>
                Categoría: {record.categoria.nombreCategoria}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                Afecta a todos los productos de esta sección
              </Typography.Text>
            </div>
          );
        }

        // Caso 2: Es un descuento directo a un Producto
        if (record.producto) {
          return (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography.Text strong>{record.producto.nombre}</Typography.Text>
              <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                Cód: {record.producto.codigo}
              </Typography.Text>
            </div>
          );
        }

        return (
          <Typography.Text type="secondary">No especificado</Typography.Text>
        );
      },
    },
    {
      title: "Porcentaje",
      dataIndex: ["descuento", "porcentajeDescuento"],
      key: "porcentajeDescuento",
      align: "center",
      render: (porcentaje) => {
        const valor = Number(porcentaje);
        return valor > 0 ? (
          <Tag color="blue">{valor}%</Tag>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        );
      },
    },
    {
      title: "Monto Fijo",
      dataIndex: ["descuento", "montoDescuento"],
      key: "montoDescuento",
      align: "right",
      render: (monto) => {
        const valor = Number(monto);
        return valor > 0 ? (
          <Typography.Text strong>{formatCurrency(valor)}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">-</Typography.Text>
        );
      },
    },
    {
      title: "Descuento Efectivo",
      key: "descuentoEfectivo",
      align: "right",
      render: (_, record) => {
        const valorPorcentaje = Number(
          record.descuento?.porcentajeDescuento || 0,
        );
        const valorMonto = Number(record.descuento?.montoDescuento || 0);

        // Buscamos el precio base si es que existe (solo si es producto directo)
        const precioBase = record.producto
          ? Number(record.producto.precioVenta || 0)
          : 0;

        // Si es un descuento por porcentaje a nivel de categoría, no sabemos el precio efectivo
        // de antemano en esta vista global porque cada producto de la categoría tiene un precio diferente.
        if (record.categoria && valorPorcentaje > 0) {
          return (
            <Typography.Text type="secondary" italic>
              Variable por prod.
            </Typography.Text>
          );
        }

        let totalDescontado = 0;

        if (valorPorcentaje > 0) {
          totalDescontado = precioBase * (valorPorcentaje / 100);
        } else if (valorMonto > 0) {
          totalDescontado = valorMonto;
        }

        return <Tag color="green">-{formatCurrency(totalDescontado)}</Tag>;
      },
    },
    {
      title: "Fecha Inicio",
      dataIndex: ["descuento", "fechaInicio"],
      key: "fechaInicio",
      align: "center",
      render: (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-CL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      title: "Estado",
      dataIndex: ["descuento", "estadoDescuento"],
      key: "estadoDescuento",
      align: "center",
      render: (estado) => (
        <Tag color={estado === "Activo" ? "green" : "red"}>
          {estado || "Desconocido"}
        </Tag>
      ),
    },
  ];

  //funciones del modal producto
  const handleAbrirModalDescuentoProducto = (producto) => {
    setSelectedProduct(producto);
    handleBuscarDescuento(producto.idProducto);
    console.log("Producto seleccionado para asignar descuento:", producto);
    setModalDescuentoProducto(true);
  };

  const handleCerrarModalDescuentoProducto = () => {
    setSelectedProduct(null);
    traerProductos();
    formDescuentoProducto.resetFields();
    setModalDescuentoProducto(false);
  };

  const confirmarDescuentoProducto = async () => {
    console.log("Descuento guardado para el producto:", selectedProduct);
    console.log(
      "Valores del formulario:",
      formDescuentoProducto.getFieldsValue(),
    );
    const datos = {
      idProducto: selectedProduct.idProducto,
      porcentajeDescuento:
        formDescuentoProducto.getFieldValue("porcentajeDescuento") || 0,
      montoDescuento:
        formDescuentoProducto.getFieldValue("montoDescuento") || 0,
    };
    try {
      const res = await registrarDescuentoSobreProducto(datos);
      console.log(
        "Respuesta del servidor al registrar descuento sobre producto:",
        res,
      );
      if (res.status === 200) {
        notification.success({
          message: "Éxito",
          description: "Descuento sobre el producto registrado exitosamente.",
        });
        handleCerrarModalDescuentoProducto();
        traerProductos();
        return;
      }
      notification.error({
        message: "Error",
        description:
          res.data.error ||
          "No se pudo registrar el descuento sobre el producto. Por favor, inténtalo de nuevo.",
      });
    } catch (error) {
      console.error(
        "Error al registrar el descuento sobre el producto:",
        error,
      );
      notification.error({
        message: "Error",
        description:
          "No se pudo registrar el descuento sobre el producto. Por favor, inténtalo de nuevo.",
      });
    }
  };

  //funciones modal buscar descuentos
  const handleBuscarDescuento = async (idProducto) => {
    try {
      const res = await buscarDescuentoProducto(idProducto);
      console.log("Descuentos recibidos:", res.data);
      if (res.status === 200) {
        setDescuentoProducto(res.data);
        return;
      }
      notification.error({
        message: res?.message || "Error al obtener los producto",
      });
    } catch (error) {
      console.log("Error al obtener productos funcion handledescuento:", error);
      notification.error({
        message: error?.message || "Error al obtener reintente",
      });
    }
  };

  const handleClickFilaDescuento = (record) => {
    // Extraemos el estado actual del objeto anidado
    console.log("cambio descueto:", record.descuento);
    const estadoActual = record.descuento?.estadoDescuento;
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";

    Modal.confirm({
      title: "¿Deseas cambiar el estado de este descuento?",
      content: `El descuento ID ${record.descuento.idDescuento} pasará a estar ${nuevoEstado}.`,
      okText: "Sí, cambiar",
      cancelText: "Cancelar",
      okType: nuevoEstado === "Inactivo" ? "danger" : "primary", // Botón rojo si se va a desactivar
      onOk: async () => {
        try {
          const res = await cambiarEstadoDescuento({
            idDescuento: record.descuento.idDescuento,
          });
          console.log(
            "Respuesta del servidor al cambiar estado de descuento:",
            res,
          );
          if (res.status === 200) {
            notification.success({
              message: "Estado actualizado",
              description: `El descuento ahora está ${nuevoEstado}.`,
            });
            // Refrescar la tabla volviendo a buscar los descuentos de ese producto
            if (selectedProduct?.idProducto) {
              handleBuscarDescuento(selectedProduct.idProducto);
            }
            return;
          }

          notification.error({
            message: "Error al actualizar",
            description:
              res.data.error ||
              "No se pudo cambiar el estado en el servidor. Por favor, inténtalo de nuevo.",
          });
        } catch (error) {
          console.log("Error al cambiar estado de descuento:", error);
          notification.error({
            message: error.message || "Error al actualizar",
            description: "No se pudo cambiar el estado en el servidor.",
          });
        }
      },
    });
  };

  //funciones modal descuento categoria
  const handleAbrirModalDescuentoCategoria = () => {
    buscarCategorias(setCategorias);
    setModalDescuentoCategoria(true);
  };

  const handleCerrarModalDescuentoCategoria = () => {
    formDescuentoCategoria.resetFields();
    setDescuentoBuscadosCategoria([]);
    setCategorias([]);
    setModalDescuentoCategoria(false);
  };

  const handleBuscarDescuentosCategoria = async (valorCategoria) => {
    try {
      const res = await buscarDescuentoCategoria(valorCategoria);
      console.log("Descuentos de categoria recibidos:", res.status);
      if (res.status === 200) {
        setDescuentoBuscadosCategoria(res.data);
        notification.info({
          message: "Descuentos encontrados",
          description: `Se encontraron descuentos para la categoría seleccionada.`,
        });
        return;
      }
      if (res.status === 204) {
        setDescuentoBuscadosCategoria([]);
        notification.info({
          message: "Sin descuentos",
          description: "No se encontraron descuentos para esta categoría.",
        });
        return;
      }
      notification.error({
        message: res?.message || "Error al obtener los descuentos de categoria",
      });
    } catch (error) {
      console.log("Error al obtener descuentos de categoria:", error);
      notification.error({
        message: error?.message || "Error al obtener descuentos de categoria",
      });
    }
  };

  const valorPorcentajeCategoria = Form.useWatch(
    "porcentajeDescuento",
    formDescuentoCategoria,
  );
  const valorMontoCategoria = Form.useWatch(
    "montoDescuento",
    formDescuentoCategoria,
  );

  const categoriaSeleccionada = Form.useWatch(
    "categoria",
    formDescuentoCategoria,
  );

  const categoriaDetalle = categorias.find(
    (c) => c.idCategoria === categoriaSeleccionada,
  );

  const confirmarDescuentoCategoria = async () => {
    const datos = {
      idCategoria: categoriaSeleccionada,
      porcentajeDescuento:
        formDescuentoCategoria.getFieldValue("porcentajeDescuento") || 0,
      montoDescuento:
        formDescuentoCategoria.getFieldValue("montoDescuento") || 0,
    };
    console.log("Datos a enviar para crear descuento de categoria:", datos);
    try {
      const res = await crearDescuentoCategoria(datos);
      console.log(
        "Respuesta del servidor al crear descuento de categoria:",
        res,
      );
      if (res.status === 200) {
        notification.success({
          message: "Descuento creado",
          description: "El descuento para la categoría se creó exitosamente.",
        });
        formDescuentoCategoria.resetFields();
        handleCerrarModalDescuentoCategoria();
        traerProductos();
        return;
      }
      notification.error({
        message: "Error",
        description:
          res.data.error ||
          "No se pudo crear el descuento para la categoría. Por favor, inténtalo de nuevo.",
      });
    } catch (error) {
      console.error("Error al crear descuento de categoria:", error);
      notification.error({
        message: "Error",
        description:
          "No se pudo crear el descuento para la categoría. Por favor, inténtalo de nuevo.",
      });
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <DataTable
        title="Gestión de Descuentos"
        data={productos}
        columns={columns}
        rowKey="idProducto"
        searchableFields={["nombre", "codigo"]}
        searchPlaceholder="Buscar por nombre o código..."
        filterConfig={[
          {
            key: "idCategoria", // Esto cruza con la propiedad idCategoria de tu JSON
            placeholder: "Filtrar por categoría",
            options: categoriaOptions,
          },
        ]}
        onRowClick={(record) => {
          handleAbrirModalDescuentoProducto(record);
        }}
        headerButtons={
          <>
            <Button type="primary" onClick={handleAbrirModalDescuentoCategoria}>
              Crear Descuento Categoria
            </Button>
          </>
        }
      />
      {/**Modal Descuento productos */}
      <Modal
        title="Asignar Descuento"
        open={modalDescuentoProducto}
        onCancel={handleCerrarModalDescuentoProducto}
        footer={null}
        centered
        width={800}
      >
        <Tabs
          defaultActiveKey="D1"
          onChange={(key) => {
            if (key == "D1") {
              handleBuscarDescuento(selectedProduct.idProducto);
            }
          }}
          items={[
            {
              key: "D1",
              label: "Descuento sobre el producto",
              children: (
                <>
                  <DataTable
                    title="Descuentos producto: "
                    data={descuentoProducto}
                    columns={columnsDescuentos}
                    onRowClick={handleClickFilaDescuento}
                  />
                </>
              ),
            },
            {
              key: "D2",
              label: "Crear Descuento",
              children: (
                <>
                  <Form
                    form={formDescuentoProducto}
                    layout="vertical"
                    onFinish={confirmarDescuentoProducto}
                  >
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Nombre del Producto">
                        {selectedProduct?.nombre}
                      </Descriptions.Item>
                      <Descriptions.Item label="Código">
                        {selectedProduct?.codigo}
                      </Descriptions.Item>
                    </Descriptions>

                    <Form.Item
                      label="Porcentaje de Descuento"
                      name="porcentajeDescuento"
                      initialValue={0}
                    >
                      <Input
                        type="number"
                        placeholder="Ingrese el porcentaje de descuento"
                        disabled={!!valorMonto}
                        suffix="%"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Monto de Descuento"
                      name="montoDescuento"
                      initialValue={0}
                    >
                      <Input
                        type="number"
                        placeholder="Ingrese el monto de descuento"
                        disabled={!!valorPorcentaje}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Guardar Descuento
                      </Button>
                    </Form.Item>
                  </Form>
                </>
              ),
            },
          ]}
        />
      </Modal>
      {/**Modal de categorias que afecta a los productos */}
      <Modal
        title="Crear Descuento para Categoría"
        open={modalDescuentoCategoria}
        onCancel={handleCerrarModalDescuentoCategoria}
        footer={null}
        centered
        width={800}
      >
        {categoriaSeleccionada && (
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Nombre Categoría">
              <Typography.Text strong>
                {categoriaDetalle?.nombreCategoria}
              </Typography.Text>
            </Descriptions.Item>

            <Descriptions.Item label="Descuentos Vigentes">
              {descuentoBuscadosCategoria &&
              descuentoBuscadosCategoria.length > 0 ? (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {descuentoBuscadosCategoria.map((item) => {
                    const vPorcentaje = Number(
                      item.descuento?.porcentajeDescuento,
                    );
                    const vMonto = Number(item.descuento?.montoDescuento);

                    return (
                      <li key={item.idDescuentoSobre}>
                        {vPorcentaje > 0 ? (
                          <Tag color="blue">{vPorcentaje}% de descuento</Tag>
                        ) : (
                          <Typography.Text strong>
                            ${vMonto} de rebaja
                          </Typography.Text>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Typography.Text type="secondary">
                  Sin descuentos vigentes actualmente
                </Typography.Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
        <Form
          form={formDescuentoCategoria}
          layout="vertical"
          onFinish={confirmarDescuentoCategoria}
        >
          <Form.Item label="Categoría" name="categoria">
            <Select
              placeholder="Seleccione la categoría a la que se aplicará el descuento"
              onChange={(value) => {
                handleBuscarDescuentosCategoria(value);
              }}
            >
              {categorias.map((categoria) => (
                <Select.Option
                  key={categoria.idCategoria}
                  value={categoria.idCategoria}
                >
                  {categoria.nombreCategoria}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Porcentaje de Descuento" name="porcentajeDescuento">
            <Input
              type="number"
              placeholder="Ingrese el porcentaje de descuento"
              disabled={!!valorMontoCategoria}
              suffix="%"
            />
          </Form.Item>

          <Form.Item label="Monto de Descuento" name="montoDescuento">
            <Input
              type="number"
              placeholder="Ingrese el monto de descuento"
              disabled={!!valorPorcentajeCategoria}
              prefix="$"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Guardar Descuento para Categoría
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
