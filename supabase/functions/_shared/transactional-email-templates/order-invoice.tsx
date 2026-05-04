import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Ramos Delivery Enterprise'

interface InvoiceItem {
  title: string
  details?: string
  qty: number
  unitPrice: number
}

interface OrderInvoiceProps {
  invoiceNumber?: string
  date?: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  paymentMethod?: string
  items?: InvoiceItem[]
  total?: number
  notes?: string
}

const OrderInvoiceEmail = ({
  invoiceNumber = 'INV-0000',
  date = new Date().toLocaleDateString(),
  customerName = '',
  customerEmail = '',
  customerPhone = '',
  customerAddress = '',
  paymentMethod = '',
  items = [],
  total = 0,
  notes = '',
}: OrderInvoiceProps) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>Invoice {invoiceNumber} — {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{SITE_NAME}</Heading>
        <Text style={subtle}>Invoice / Factura</Text>

        <Section style={metaBox}>
          <Row>
            <Column>
              <Text style={metaLabel}>Invoice #</Text>
              <Text style={metaValue}>{invoiceNumber}</Text>
            </Column>
            <Column>
              <Text style={metaLabel}>Date</Text>
              <Text style={metaValue}>{date}</Text>
            </Column>
          </Row>
        </Section>

        <Heading as="h2" style={h2}>Bill to / Cliente</Heading>
        <Text style={text}>
          {customerName && <><strong>{customerName}</strong><br /></>}
          {customerEmail && <>{customerEmail}<br /></>}
          {customerPhone && <>{customerPhone}<br /></>}
          {customerAddress && <>{customerAddress}</>}
        </Text>

        <Hr style={hr} />

        <Heading as="h2" style={h2}>Items</Heading>
        <Section>
          {items.map((it, i) => (
            <Row key={i} style={itemRow}>
              <Column style={{ width: '65%' }}>
                <Text style={itemTitle}>{it.title}</Text>
                {it.details && <Text style={itemDetails}>{it.details}</Text>}
                <Text style={itemDetails}>{it.qty} × ${it.unitPrice.toFixed(2)}</Text>
              </Column>
              <Column style={{ width: '35%', textAlign: 'right' }}>
                <Text style={itemPrice}>${(it.qty * it.unitPrice).toFixed(2)}</Text>
              </Column>
            </Row>
          ))}
        </Section>

        <Hr style={hr} />

        <Section>
          <Row>
            <Column style={{ width: '65%' }}>
              <Text style={totalLabel}>TOTAL</Text>
            </Column>
            <Column style={{ width: '35%', textAlign: 'right' }}>
              <Text style={totalValue}>${total.toFixed(2)}</Text>
            </Column>
          </Row>
        </Section>

        {paymentMethod && (
          <>
            <Hr style={hr} />
            <Text style={text}>
              <strong>Payment method:</strong> {paymentMethod}
            </Text>
          </>
        )}

        {notes && <Text style={text}>{notes}</Text>}

        <Hr style={hr} />
        <Text style={footer}>
          Thank you for your order. / Gracias por su compra.<br />
          {SITE_NAME}
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderInvoiceEmail,
  subject: (data: Record<string, any>) =>
    `Invoice ${data?.invoiceNumber ?? ''} — ${SITE_NAME}`.trim(),
  displayName: 'Order Invoice',
  previewData: {
    invoiceNumber: 'INV-1024',
    date: '2026-05-04',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 555 123 4567',
    customerAddress: '123 Main St, San Juan, PR',
    paymentMethod: 'Zelle',
    items: [
      { title: 'Custom Crate 24x24x24', details: 'Plywood, foam lining', qty: 1, unitPrice: 250 },
      { title: 'Delivery', details: 'San Juan → Ponce', qty: 1, unitPrice: 120 },
    ],
    total: 370,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111111', margin: '0 0 4px' }
const h2 = { fontSize: '14px', fontWeight: 'bold', color: '#111111', margin: '20px 0 8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const subtle = { fontSize: '12px', color: '#888', margin: '0 0 20px', textTransform: 'uppercase' as const, letterSpacing: '2px' }
const text = { fontSize: '14px', color: '#333', lineHeight: '1.5', margin: '0 0 12px' }
const metaBox = { backgroundColor: '#f7f7f5', padding: '12px 16px', borderRadius: '4px', margin: '12px 0' }
const metaLabel = { fontSize: '10px', color: '#888', margin: '0', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const metaValue = { fontSize: '14px', color: '#111', margin: '2px 0 0', fontWeight: 'bold' }
const itemRow = { borderBottom: '1px solid #eee', padding: '8px 0' }
const itemTitle = { fontSize: '14px', color: '#111', margin: '0', fontWeight: 'bold' }
const itemDetails = { fontSize: '12px', color: '#666', margin: '2px 0 0' }
const itemPrice = { fontSize: '14px', color: '#111', margin: '0', fontWeight: 'bold' }
const totalLabel = { fontSize: '14px', color: '#111', margin: '0', fontWeight: 'bold', letterSpacing: '1px' }
const totalValue = { fontSize: '20px', color: '#111', margin: '0', fontWeight: 'bold' }
const hr = { borderColor: '#eee', margin: '16px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '20px 0 0', textAlign: 'center' as const }
