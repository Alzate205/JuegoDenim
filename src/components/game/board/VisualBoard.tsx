interface VisualBoardProps {
  currentWeek: number;
  inventory: {
    rawMaterial: number;
    finishedGoods: number;
  } | null;
  pendingOrders: any[];
}

export function VisualBoard({
  currentWeek,
  inventory,
  pendingOrders
}: VisualBoardProps) {
  const totalPending = pendingOrders?.length ?? 0;
  const raw = inventory?.rawMaterial ?? 0;
  const finished = inventory?.finishedGoods ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-100">
        <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700">
          Semana {currentWeek}
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700">
          Pedidos pendientes:{" "}
          <span className="font-semibold">{totalPending}</span>
        </span>
      </div>

      <div className="board-map">
        {/* Carreteras */}
        <div className="board-road-main" />
        <div className="board-road-top" />
        <div className="board-road-bottom" />

        {/* Bases redondas tipo plataforma */}
        {/* Retailer (arriba izquierda) */}
        <div
          className="board-node-base"
          style={{ left: "11%", top: "18%" }}
        />
        {/* Distributor (abajo izquierda) */}
        <div
          className="board-node-base"
          style={{ left: "14%", bottom: "10%" }}
        />
        {/* Wholesaler (arriba derecha) */}
        <div
          className="board-node-base"
          style={{ right: "12%", top: "15%" }}
        />
        {/* Manufacturer (abajo derecha) */}
        <div
          className="board-node-base"
          style={{ right: "13%", bottom: "8%" }}
        />

        {/* Tarjetas de estaciones */}

        {/* Tienda minorista */}
        <div
          className="board-building-card"
          style={{ left: "9%", top: "8%" }}
        >
          <div className="board-building-icon bg-amber-200 border border-amber-300">
            🏪
          </div>
          <div className="board-building-body">
            <p className="board-building-title">Tienda minorista</p>
            <p className="board-building-sub">
              Punto de contacto con el cliente final.
            </p>
            <p className="mt-1 text-[11px] text-slate-700">
              Stock estimado:{" "}
              <span className="font-semibold">
                {Math.max(0, Math.round(finished * 0.25))} uds
              </span>
            </p>
          </div>
        </div>

        {/* Distribuidor */}
        <div
          className="board-building-card"
          style={{ left: "6%", bottom: "18%" }}
        >
          <div className="board-building-icon bg-sky-200 border border-sky-300">
            🏢
          </div>
          <div className="board-building-body">
            <p className="board-building-title">Distribuidor</p>
            <p className="board-building-sub">
              Consolida pedidos y gestiona el flujo hacia tiendas.
            </p>
            <p className="mt-1 text-[11px] text-slate-700">
              Flujo semanal estimado:{" "}
              <span className="font-semibold">
                {Math.max(0, Math.round(finished * 0.15))} uds
              </span>
            </p>
          </div>
        </div>

        {/* Mayorista */}
        <div
          className="board-building-card"
          style={{ right: "6%", top: "10%" }}
        >
          <div className="board-building-icon bg-violet-200 border border-violet-300">
            🏭
          </div>
          <div className="board-building-body">
            <p className="board-building-title">Mayorista</p>
            <p className="board-building-sub">
              Equilibra inventarios entre fábrica y distribuidores.
            </p>
            <p className="mt-1 text-[11px] text-slate-700">
              Stock intermedio:{" "}
              <span className="font-semibold">
                {Math.max(0, Math.round(finished * 0.35))} uds
              </span>
            </p>
          </div>
        </div>

        {/* Fábrica de denim */}
        <div
          className="board-building-card"
          style={{ right: "6%", bottom: "16%" }}
        >
          <div className="board-building-icon bg-rose-200 border border-rose-300">
            🧵
          </div>
          <div className="board-building-body">
            <p className="board-building-title">Fábrica de denim</p>
            <p className="board-building-sub">
              Convierte materia prima en jeans terminados.
            </p>
            <div className="mt-1 text-[11px] text-slate-700 space-y-1">
              <p>
                Materia prima disponible:{" "}
                <span className="font-semibold">{raw} uds</span>
              </p>
              <p>
                Producción estimada en curso:{" "}
                <span className="font-semibold">
                  {Math.max(0, Math.round(finished * 0.4))} uds
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Camiones animados sobre cada carretera */}
        <div
          className="board-truck truck-anim-main"
          style={{ top: "48%", left: "0%" }}
        >
          🚚
        </div>
        <div
          className="board-truck truck-anim-main"
          style={{ top: "52%", left: "20%" }}
        >
          🚚
        </div>
        <div
          className="board-truck truck-anim-main"
          style={{ top: "50%", left: "40%" }}
        >
          🚚
        </div>

        <div
          className="board-truck truck-anim-bottom"
          style={{ bottom: "14%", left: "80%" }}
        >
          🚚
        </div>
        <div
          className="board-truck truck-anim-top"
          style={{ top: "15%", left: "15%" }}
        >
          🚚
        </div>

        {/* Árboles y rocas sueltos */}
        <div className="board-tree" style={{ left: "30%", top: "15%" }} />
        <div className="board-tree" style={{ left: "40%", top: "25%" }} />
        <div className="board-tree" style={{ right: "18%", top: "22%" }} />
        <div className="board-tree" style={{ right: "25%", bottom: "20%" }} />
        <div className="board-tree" style={{ left: "22%", bottom: "22%" }} />

        <div className="board-rock" style={{ left: "36%", bottom: "18%" }} />
        <div className="board-rock" style={{ right: "34%", top: "28%" }} />

        {/* Burbuja central tipo tutorial */}
        <div
          className="board-bubble"
          style={{ left: "50%", top: "45%", transform: "translateX(-50%)" }}
        >
          <p className="text-xs font-semibold mb-1">
            Bienvenido a Denim Factory
          </p>
          <p className="text-[11px] leading-snug">
            Cada rol toma decisiones sobre pedidos, producción, calidad y
            envíos. Observa cómo se mueve el inventario a lo largo de la
            cadena.
          </p>
          <p className="mt-2 text-[11px] opacity-90">
            En la parte inferior encontrarás los indicadores numéricos de la
            semana.
          </p>
        </div>
        <div
          className="board-bubble-dot"
          style={{ left: "50%", top: "56%", transform: "translateX(-50%)" }}
        />

        {/* Franja de tierra al fondo */}
        <div className="board-soil" />
      </div>
    </div>
  );
}
