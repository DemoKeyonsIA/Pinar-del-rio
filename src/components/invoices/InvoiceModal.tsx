import React from 'react';
import { Invoice, PaymentRecord } from '../../types';
import { PinarLogo } from '../common/PinarLogo';
import { CONDO_BANK_INFO } from '../../data/mockData';
import { X, Printer, Download, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface InvoiceModalProps {
  invoice: Invoice | null;
  paymentRecord?: PaymentRecord;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  invoice,
  paymentRecord,
  onClose,
}) => {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'paid' || (paymentRecord && paymentRecord.status === 'applied');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-8 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Actions bar (hidden in print) */}
        <div className="no-print bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Documento Oficial Certificado</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 transition-colors cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-800 text-xs font-medium text-white hover:bg-emerald-900 transition-colors cursor-pointer shadow-sm"
              title="Descargar versión en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Sheet */}
        <div className="p-8 text-slate-900 font-sans printable-invoice">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-200">
            <div>
              <PinarLogo size="md" />
              <div className="mt-3 text-xs text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-800">{CONDO_BANK_INFO.legalEntity}</p>
                <p>Cédula Jurídica: {CONDO_BANK_INFO.legalId}</p>
                <p>Belén, Heredia / San José, Costa Rica</p>
                <p>Regulado según Ley de Propiedad en Condominio N.º 7933</p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="inline-block bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1 mb-2">
                <span className="text-[11px] font-bold text-emerald-800 tracking-wider">
                  COMPROBANTE DE CUOTA
                </span>
              </div>
              <p className="font-mono text-sm font-bold text-slate-900">
                {invoice.id}
              </p>
              <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                <p><span className="text-slate-400">Emisión:</span> {invoice.issueDate}</p>
                <p><span className="text-slate-400">Vencimiento:</span> {invoice.dueDate}</p>
                <p className="font-medium text-slate-800">
                  Período: {invoice.month}
                </p>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="my-6">
            {isPaid ? (
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-emerald-800">ESTADO: PAGADO Y CONCILIADO</span>
                  {paymentRecord ? (
                    <span className="text-emerald-700 ml-1">
                      — Transacción {paymentRecord.id} ({paymentRecord.method === 'sinpe' ? 'SINPE Móvil' : 'Transferencia'} Ref: {paymentRecord.reference})
                    </span>
                  ) : (
                    <span className="text-emerald-700 ml-1">
                      — Pago aplicado en cuenta general de la filial.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-amber-800">ESTADO: PENDIENTE DE PAGO</span>
                  <span className="text-amber-700 ml-1">
                    — Favor reportar comprobante antes de la fecha límite ({invoice.dueDate}).
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Resident & Unit Details */}
          <div className="bg-slate-50/80 rounded-xl p-4 mb-6 border border-slate-200/80 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Condómino / Titular</p>
              <p className="font-semibold text-slate-900 mt-0.5">{invoice.ownerName}</p>
              <p className="text-slate-600">Identificación: {invoice.ownerIdNumber}</p>
            </div>
            <div>
              <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">Unidad Privativa</p>
              <p className="font-semibold text-emerald-800 mt-0.5">{invoice.unitNumber}</p>
              <p className="text-slate-600">Residencial Pinar del Río</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden mb-6">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Concepto / Rubro Condominal</th>
                  <th className="py-2.5 px-4 text-right">Monto (CRC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-4 text-slate-700">{item.concept}</td>
                    <td className="py-2.5 px-4 text-right font-mono text-slate-900 tabular-nums">
                      ₡{item.amount.toLocaleString('es-CR')}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                <tr>
                  <td className="py-3 px-4 text-slate-800 font-bold text-sm">TOTAL A PAGAR:</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800 font-bold text-base tabular-nums">
                    ₡{invoice.total.toLocaleString('es-CR')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Footnote & Signature */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[11px] text-slate-500">
            <div className="max-w-xs space-y-1">
              <p className="font-medium text-slate-700">Normativa Aplicable:</p>
              <p>
                Este comprobante respalda los gastos comunes de la Finca Filial conforme al Art. 21 y 22 de la Ley 7933. Las cuotas no canceladas generan intereses moratorios según el reglamento.
              </p>
            </div>
            
            <div className="text-center sm:text-right border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0 w-full sm:w-auto">
              <div className="h-10 flex items-center justify-end">
                <span className="font-mono text-emerald-700 text-xs italic tracking-wider">
                  [Firmado Digitalmente]
                </span>
              </div>
              <p className="border-t border-slate-300 pt-1 font-semibold text-slate-800">
                Licda. Sofía Morales
              </p>
              <p className="text-[10px]">Administradora General — Pinar del Río</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
