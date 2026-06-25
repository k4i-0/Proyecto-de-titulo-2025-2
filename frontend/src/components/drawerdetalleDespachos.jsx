import React from "react";
import { Drawer, Descriptions, Card, Divider, Typography } from "antd";

export default function DrawerDetalleDespachos({ open, onClose, ordenDrawer }) {
  console.log("ordenDrawer", ordenDrawer);
  return (
    <Drawer
      title="Despachos asociados a la orden de compra"
      open={open}
      onClose={onClose}
      width={500}
      style={{ backgroundColor: "#e1dfdf" }}
    >
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="Nombre Orden" span={2}>
          {ordenDrawer?.nombreOrden}
        </Descriptions.Item>
        <Descriptions.Item label="Fecha">
          {new Date(ordenDrawer?.fechaOrden).toLocaleDateString("es-CL")}
        </Descriptions.Item>
        <Descriptions.Item label="Tipo">{ordenDrawer?.tipo}</Descriptions.Item>
      </Descriptions>

      {ordenDrawer?.despachos?.length > 0 ? (
        <>
          {ordenDrawer.despachos.map((despacho, index) => (
            <Card
              title={`Despacho ${index + 1}`}
              key={index}
              style={{ backgroundColor: "#f0f0f0", marginTop: 20 }}
            >
              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Código despacho">
                  {despacho.codigoDespacho || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Fecha">
                  {new Date(despacho.fechaDespacho).toLocaleDateString(
                    "es-CL",
                  ) || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="tipo despacho">
                  {despacho.tipoDespacho || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Tipo Documento">
                  {despacho.tipoDocumento || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="Estado">
                  {despacho.estado || "-"}
                </Descriptions.Item>
              </Descriptions>

              {despacho.detalledespachos?.length > 0 && (
                <>
                  <Divider style={{ margin: "12px 0" }} />
                  <Typography.Text strong>Lotes recepcionados</Typography.Text>
                  {despacho.detalledespachos.map((detalle, dIndex) => (
                    <div key={dIndex} size="small" style={{ marginTop: 8 }}>
                      <Typography.Text type="secondary">
                        Cantidad: {detalle.cantidad}
                      </Typography.Text>
                      {detalle.lotes?.map((lote, lIndex) => (
                        <Descriptions
                          key={lIndex}
                          column={1}
                          size="small"
                          bordered
                          style={{ marginTop: 6 }}
                        >
                          <Descriptions.Item label="Código">
                            {lote.codigoLote || "-"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Vencimiento">
                            {lote.fechaVencimiento
                              ? new Date(
                                  lote.fechaVencimiento,
                                ).toLocaleDateString("es-CL")
                              : "Sin vencimiento"}
                          </Descriptions.Item>
                          <Descriptions.Item label="Cantidad recibida">
                            {detalle.cantidadRecibida || 0}
                          </Descriptions.Item>
                          <Descriptions.Item label="Cantidad rechazada">
                            {detalle.cantidadRechazada || 0}
                          </Descriptions.Item>
                          <Descriptions.Item label="Producto">
                            {lote.producto?.nombre || "-"}
                          </Descriptions.Item>
                        </Descriptions>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </Card>
          ))}
        </>
      ) : (
        <div style={{ paddingTop: 20 }}>
          <Card title="Despachos" size="small">
            <p>Sin Despachos para la orden {ordenDrawer?.nombreOrden || "-"}</p>
          </Card>
        </div>
      )}
    </Drawer>
  );
}
