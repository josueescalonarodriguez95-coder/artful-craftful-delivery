/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  name?: string
  email?: string
  message?: string
}

const Email = ({ name, email, message }: Props) => (
  <Html lang="es" dir="ltr">
    <Head />
    <Preview>{`Nuevo mensaje de ${name || 'un visitante'}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nuevo mensaje del sitio web</Heading>
        <Text style={label}>Nombre</Text>
        <Text style={value}>{name || '—'}</Text>
        <Text style={label}>Email</Text>
        <Text style={value}>{email || '—'}</Text>
        <Hr style={hr} />
        <Section>
          <Text style={label}>Mensaje</Text>
          <Text style={value}>{message || '—'}</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>Ramos Delivery Enterprise · +1 (786) 426-2444</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Nuevo mensaje de ${data?.name || 'un visitante'} — Ramos Delivery`,
  displayName: 'Mensaje de contacto',
  previewData: {
    name: 'Ana Pérez',
    email: 'ana@example.com',
    message: 'Necesito una cotización para transportar 3 obras.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '20px', color: '#111111', margin: '0 0 20px' }
const label = {
  fontSize: '11px',
  letterSpacing: '1.5px',
  textTransform: 'uppercase' as const,
  color: '#b3122b',
  margin: '14px 0 2px',
}
const value = { fontSize: '15px', color: '#222222', margin: '0', whiteSpace: 'pre-wrap' as const }
const hr = { borderColor: '#eeeeee', margin: '20px 0' }
const footer = { fontSize: '12px', color: '#888888' }
