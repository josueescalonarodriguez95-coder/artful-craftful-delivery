import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
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
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  customerAddress?: string
  paymentMethod?: string
  items?: InvoiceItem[]
  total?: number
  date?: string
  isMerchantCopy?: boolean
}

const OrderInvoiceEmail = ({
  invoiceNumber = 'INV-0000',
  customerName = 'Customer',
  customerEmail = '',
  customerPhone = '',
  customerAddress = '',
  paymentMethod = 'Card',
  items = [],
  total = 0,
  date = new Date().toLocaleDateString(),
  isMerchantCopy = false,
}: OrderInvoiceProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Invoice ${invoiceNumber} from ${SITE_NAME}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>{SITE_NAME}</Heading>
        <Text style={muted}>
          {isMerchantCopy ? 'New order received' : 'Thank you for your purchase'}
        </Text>

        <Section style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={labelCell}>Invoice</td>
                <td style={valueCell}>{invoiceNumber}</td>
              </tr>
              <tr>
                <td style={labelCell}>Date</td>
                <td style={valueCell}>{date}</td>
              </tr>
              <tr>
                <td style={labelCell}>Payment</td>
                <td style={valueCell}>{paymentMethod}</td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Heading as="h2" style={h2}>Customer</Heading>
        <Text style={text}>
          <strong>{customerName}</strong><br />
          {customerEmail}<br />
          {customerPhone && (<>{customerPhone}<br /></>)}
          {customerAddress}
        </Text>

        <Heading as="h2" style={h2}>Items</Heading>
        <Section>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}>Description</th>
                <th style={{ ...th, textAlign: 'right' }}>Qty</th>
                <th style={{ ...th, textAlign: 'right' }}>Price</th>
                <th style={{ ...th, textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td style={td}>
                    <strong>{it.title}</strong>
                    {it.details ? <div style={{ fontSize: '12px', color: '#777' }}>{it.details}</div> : null}
                  </td>
                  <td style={{ ...td, textAlign: 'right' }}>{it.qty}</td>
                  <td style={{ ...td, textAlign: 'right' }}>${it.unitPrice.toFixed(2)}</td>
                  <td style={{ ...td, textAlign: 'right' }}>${(it.qty * it.unitPrice).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Hr style={hr} />
        <Section>
          <table style={{ width: '100%' }}>
            <tbody>
              <tr>
                <td style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>Total</td>
                <td style={{ fontSize: '20px', fontWeight: 'bold', textAlign: 'right', color: '#000' }}>
                  ${total.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        <Text style={footer}>{SITE_NAME} · ramosdeliverye@gmail.com</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderInvoiceEmail,
  subject: (data: Record<string, any>) =>
    data.isMerchantCopy
      ? `New order ${data.invoiceNumber || ''} — ${data.customerName || ''}`
      : `Your invoice ${data.invoiceNumber || ''} from ${SITE_NAME}`,
  displayName: 'Order invoice',
  previewData: {
    invoiceNumber: 'INV-1024',
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+1 555 555 5555',
    customerAddress: '123 Main St, Miami, FL',
    paymentMethod: 'Card (Visa •••• 4242)',
    items: [
      { title: 'Custom crate 24×24×24', details: 'Plywood + foam', qty: 1, unitPrice: 350 },
      { title: 'Local delivery', details: '15 mi', qty: 1, unitPrice: 120 },
    ],
    total: 470,
    date: '2026-05-04',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#111', margin: '0 0 4px' }
const h2 = { fontSize: '14px', fontWeight: 'bold', color: '#111', margin: '20px 0 8px', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }
const muted = { fontSize: '13px', color: '#777', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#222', lineHeight: '1.6', margin: '0 0 12px' }
const card = { background: '#f7f7f4', padding: '14px 16px', borderRadius: '6px', margin: '8px 0 16px' }
const labelCell = { fontSize: '12px', color: '#777', padding: '4px 0', width: '90px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
const valueCell = { fontSize: '14px', color: '#111', padding: '4px 0' }
const th = { fontSize: '12px', color: '#777', textAlign: 'left' as const, borderBottom: '1px solid #e5e5e0', padding: '8px 4px', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }
const td = { fontSize: '14px', color: '#222', borderBottom: '1px solid #f0f0eb', padding: '10px 4px' }
const hr = { border: 'none', borderTop: '1px solid #e5e5e0', margin: '16px 0' }
const footer = { fontSize: '11px', color: '#999', marginTop: '24px', textAlign: 'center' as const }
