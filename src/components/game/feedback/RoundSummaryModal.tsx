import { Modal } from "components/common/Modal";

interface RoundSummaryModalProps {
  open: boolean;
  onClose: () => void;
  result: any;
}

export function RoundSummaryModal({
  open,
  onClose,
  result
}: RoundSummaryModalProps) {
  if (!result) return null;

  return (
    <Modal open={open} onClose={onClose} title="Resumen de la semana">
      <div className="space-y-2 text-sm text-slate-100">
        <p>
          Ingresos:{" "}
          <span className="font-semibold">
            $ {result.income.toFixed(0)}
          </span>
        </p>
        <p>
          Costos totales:{" "}
          <span className="font-semibold">
            ${" "}
            {(
              result.costs.rawMaterial +
              result.costs.labor +
              result.costs.quality +
              result.costs.logistics +
              result.costs.interests +
              result.costs.penalties
            ).toFixed(0)}
          </span>
        </p>
        <p>
          Utilidad de la semana:{" "}
          <span className="font-semibold">
            $ {result.newFinancialState.weeklyProfit.toFixed(0)}
          </span>
        </p>
        <p>
          Utilidad acumulada:{" "}
          <span className="font-semibold">
            $ {result.newFinancialState.accumulatedProfit.toFixed(0)}
          </span>
        </p>
      </div>
    </Modal>
  );
}
