import React from "react";
import { Modal, Descriptions, Tag, Typography } from "antd";

export default function Detalle({
  Producto,
  modalDetalle,
  handleCerrarDetalle,
}) {
  if (!Producto) return null;

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(value || 0);

  const formatDate = (value) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return "-";
    }
  };

  return (
    <Modal
      title={`Detalle del producto: ${Producto.nombre || Producto.codigo}`}
      open={!!modalDetalle}
      onCancel={handleCerrarDetalle}
      footer={null}
      width={720}
    >
      <Descriptions column={1} bordered>
        <Descriptions.Item label="NPI">{Producto.idProducto}</Descriptions.Item>
        <Descriptions.Item label="Código">
          {Producto.codigo || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Nombre">
          {Producto.nombre || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Marca">
          {Producto.marca || "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Categoría">
          {Producto.categoria?.nombreCategoria ? (
            <Tag color="blue">{Producto.categoria.nombreCategoria}</Tag>
          ) : (
            <Typography.Text type="secondary">-</Typography.Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Precio Venta">
          {formatCurrency(Producto.precioVenta)}
        </Descriptions.Item>
        <Descriptions.Item label="Precio Compra">
          {formatCurrency(Producto.precioCompra)}
        </Descriptions.Item>
        <Descriptions.Item label="Peso">
          {Producto.peso ? `${Producto.peso} kg` : "-"}
        </Descriptions.Item>
        <Descriptions.Item label="Estado">
          <Tag>{Producto.estado || "-"}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Fecha Creación">
          {formatDate(Producto.fechaCreacion)}
        </Descriptions.Item>
        <Descriptions.Item label="Descripción">
          {Producto.descripcion || "-"}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
