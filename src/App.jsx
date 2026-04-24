import { useState, useEffect, useRef } from "react";

const POINTS_OPTIONS = [3, 5, 10];
const DRUG = {
  red: "#e03030",
  gold: "#f0a800",
  bg: "#f7f5f2",
  text: "#1a1a1a",
  sub: "#767268",
  border: "#e8e4de",
};
const THEME_APP = {
  primary: "#e03030",
  light: "#f25050",
  bg: "#fdf5f5",
  shadow: "rgba(224,48,48,.28)",
};
const THEME_WEB = {
  primary: "#1a3f7a",
  light: "#2557a7",
  bg: "#eaeff8",
  shadow: "rgba(26,63,122,.28)",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;700;900&display=swap');
*,*::before,*::after{box-sizing:border-box}
@keyframes ringExpand{0%{transform:scale(.35);opacity:.8}100%{transform:scale(2.8);opacity:0}}
@keyframes phonePulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
@keyframes popIn{0%{transform:scale(.25);opacity:0}62%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes confettiFall{0%{transform:translateY(-6px) rotate(0);opacity:1}100%{transform:translateY(82px) rotate(580deg);opacity:0}}
@keyframes checkDraw{from{stroke-dashoffset:64}to{stroke-dashoffset:0}}
@keyframes shimmer{0%,100%{opacity:.1}50%{opacity:.36}}
@keyframes lightBlink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.28;transform:scale(.62)}}
@keyframes installProgress{from{width:0%}to{width:100%}}
@keyframes slideRight{from{opacity:0;transform:translateX(22px)}to{opacity:1;transform:translateX(0)}}
@keyframes starPop{0%{transform:scale(0);opacity:0}65%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
`;

export default function App() {
  const [screen, setScreen] = useState("nfc");
  const [hasApp, setHasApp] = useState(null);
  const [adTime, setAdTime] = useState(15);
  const [showSkip, setShowSkip] = useState(false);
  const [phase, setPhase] = useState("spinning");
  const [points, setPoints] = useState(null);
  const [fading, setFading] = useState(false);
  const theme = hasApp === false ? THEME_WEB : THEME_APP;

  const go = (next) => {
    setFading(true);
    setTimeout(() => {
      setScreen(next);
      setFading(false);
    }, 240);
  };

  useEffect(() => {
    if (screen !== "nfc") return;
    const t = setTimeout(() => go("branch"), 3000);
    return () => clearTimeout(t);
  }, [screen]);

  useEffect(() => {
    if (screen !== "ad") return;
    setAdTime(15);
    setShowSkip(false);
    let t = 15;
    const iv = setInterval(() => {
      t--;
      setAdTime(t);
      if (t <= 0) {
        clearInterval(iv);
        go("lottery");
      }
    }, 1000);
    const sk = setTimeout(() => setShowSkip(true), 5000);
    return () => {
      clearInterval(iv);
      clearTimeout(sk);
    };
  }, [screen]);

  useEffect(() => {
    if (screen !== "lottery") return;
    setPhase("spinning");
    const p = POINTS_OPTIONS[Math.floor(Math.random() * POINTS_OPTIONS.length)];
    setPoints(p);
    const t1 = setTimeout(() => setPhase("stopping"), 2800);
    const t2 = setTimeout(() => go("prize"), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [screen]);

  const reset = () => {
    setScreen("nfc");
    setHasApp(null);
    setPoints(null);
  };
  const pickApp = (v) => {
    setHasApp(v);
    go("ad");
  };

  const darkScreen = screen === "nfc";
  const inApp =
    hasApp !== null &&
    !darkScreen &&
    screen !== "branch" &&
    screen !== "lottery";

  return (
    <>
      <style>{CSS}</style>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg,#0c1420,#162032,#0a0f1a)",
          fontFamily: "'Noto Sans JP',sans-serif",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 390,
            height: 844,
            background: "linear-gradient(160deg,#1a1a1a,#0d0d0d)",
            borderRadius: 54,
            boxShadow:
              "0 0 0 1.5px #303030,0 0 0 4px #111,0 0 0 5px #1c1c1c,0 60px 130px rgba(0,0,0,.97)",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 13,
              left: "50%",
              transform: "translateX(-50%)",
              width: 124,
              height: 36,
              background: "#000",
              borderRadius: 22,
              zIndex: 300,
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: darkScreen ? "#08101c" : DRUG.bg,
              opacity: fading ? 0 : 1,
              transition: "opacity .24s ease",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <StatusBar dark={darkScreen} themed={inApp} />
            {inApp && hasApp && <DrugAppBar />}
            {inApp && !hasApp && <BrowserBar />}
            <div
              style={{
                flex: 1,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {screen === "nfc" && <NFCScr />}
              {screen === "branch" && <BranchScr onSelect={pickApp} />}
              {screen === "ad" && (
                <AdScr
                  time={adTime}
                  showSkip={showSkip}
                  onSkip={() => go("lottery")}
                />
              )}
              {screen === "lottery" && (
                <LotteryScr phase={phase} points={points} />
              )}
              {screen === "prize" && (
                <PrizeScr
                  points={points}
                  hasApp={hasApp}
                  theme={theme}
                  onNext={() => go(hasApp ? "received" : "appstore")}
                />
              )}
              {screen === "received" && (
                <ReceivedScr
                  points={points}
                  theme={theme}
                  onNext={() => go("apptop")}
                />
              )}
              {screen === "apptop" && (
                <AppTopScr
                  points={points}
                  theme={theme}
                  onNext={() => go("end")}
                />
              )}
              {screen === "appstore" && (
                <AppStoreScr theme={theme} onNext={() => go("osappstore")} />
              )}
              {screen === "osappstore" && (
                <OsAppStoreScr theme={theme} onNext={() => go("end")} />
              )}
              {screen === "end" && <EndScr onReset={reset} />}
            </div>
            {inApp && hasApp && <BottomTabBar />}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 9,
              left: "50%",
              transform: "translateX(-50%)",
              width: 134,
              height: 5,
              background: "rgba(255,255,255,.18)",
              borderRadius: 3,
              zIndex: 200,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 7,
          }}
        >
          <button
            onClick={reset}
            style={{
              padding: "10px 30px",
              background: "rgba(255,255,255,.06)",
              color: "rgba(255,255,255,.5)",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: 24,
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "'Noto Sans JP',sans-serif",
            }}
          >
            最初からやり直す
          </button>
          {hasApp !== null && (
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,.26)",
                letterSpacing: ".06em",
              }}
            >
              {hasApp ? "アプリあり ルート" : "アプリなし（ブラウザ）ルート"}
            </span>
          )}
        </div>
      </div>
    </>
  );
}

function StatusBar({ dark, themed }) {
  const bg = themed ? DRUG.red : "transparent";
  const fg = dark || themed ? "rgba(255,255,255,.88)" : "rgba(0,0,0,.6)";
  return (
    <div
      style={{
        height: 52,
        padding: "0 24px",
        display: "flex",
        alignItems: "flex-end",
        paddingBottom: 8,
        justifyContent: "space-between",
        background: bg,
        color: fg,
        fontSize: 13,
        fontWeight: 600,
        flexShrink: 0,
        zIndex: 99,
      }}
    >
      <span>9:41</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <SigSVG c={fg} />
        <WifiSVG c={fg} />
        <BattSVG c={fg} />
      </div>
    </div>
  );
}

function DrugAppBar() {
  return (
    <div
      style={{
        background: DRUG.red,
        padding: "6px 16px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 6,
            background: DRUG.gold,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 18, fontWeight: 900, color: DRUG.red }}>
            A
          </span>
        </div>
        <div
          style={{
            color: "white",
            fontSize: 15,
            fontWeight: 900,
            letterSpacing: ".03em",
          }}
        >
          ドラッグストアA
        </div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <NavIconSVG type="search" c="white" />
        <div style={{ position: "relative" }}>
          <NavIconSVG type="bell" c="white" />
          <div
            style={{
              position: "absolute",
              top: -2,
              right: -3,
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: DRUG.gold,
              border: "1.5px solid " + DRUG.red,
            }}
          />
        </div>
        <NavIconSVG type="rpoint" c="white" />
      </div>
    </div>
  );
}

function BrowserBar() {
  return (
    <div
      style={{
        background: "#f0ede8",
        padding: "5px 14px",
        borderBottom: "1px solid #e0dcd4",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div
        style={{
          flex: 1,
          background: "white",
          borderRadius: 9,
          padding: "6px 12px",
          fontSize: 12,
          color: "#5a5a56",
          border: "1px solid #dfdcd6",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <LockSVG size={11} /> stg.supership.jp/gift
      </div>
    </div>
  );
}

function BottomTabBar() {
  const tabs = [
    { icon: "barcode", label: "ポイント", active: false },
    { icon: "topics", label: "トピックス", active: false },
    { icon: "coupon", label: "クーポン", active: true },
    { icon: "book", label: "お薬手帳", active: false },
    { icon: "more", label: "その他", active: false },
  ];
  return (
    <div
      style={{
        height: 60,
        background: "white",
        borderTop: "1px solid #e8e4de",
        display: "flex",
        alignItems: "center",
        flexShrink: 0,
        paddingBottom: 2,
      }}
    >
      {tabs.map((t, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            color: t.active ? DRUG.red : "#9e9990",
          }}
        >
          <TabIconSVG type={t.icon} active={t.active} />
          <span style={{ fontSize: 9, fontWeight: t.active ? 700 : 400 }}>
            {t.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function NFCScr() {
  return (
    <div
      style={{
        flex: 1,
        background: "radial-gradient(ellipse at 50% 44%,#0e2438,#040b14)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 22,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 70 + i * 90,
            height: 70 + i * 90,
            borderRadius: "50%",
            border: "1.2px solid rgba(80,190,255," + (0.22 - i * 0.04) + ")",
            animation: "ringExpand 2.8s ease-out " + i * 0.6 + "s infinite",
          }}
        />
      ))}
      <div
        style={{ animation: "phonePulse 2.2s ease-in-out infinite", zIndex: 2 }}
      >
        <NfcIllSVG />
      </div>
      <div style={{ textAlign: "center", zIndex: 2 }}>
        <div
          style={{
            color: "white",
            fontSize: 21,
            fontWeight: 700,
            letterSpacing: ".05em",
            marginBottom: 9,
          }}
        >
          NFCをタッチ
        </div>
        <div
          style={{
            color: "rgba(80,190,255,.5)",
            fontSize: 13,
            letterSpacing: ".04em",
          }}
        >
          端末を読み取り機にかざしてください
        </div>
      </div>
    </div>
  );
}

function BranchScr({ onSelect }) {
  return (
    <div
      style={{
        flex: 1,
        background: DRUG.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        overflow: "auto",
      }}
    >
      <div
        style={{
          width: "100%",
          background: "linear-gradient(90deg,#1a2f50,#243b65)",
          padding: "11px 18px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            background: "rgba(255,180,0,.18)",
            border: "1px solid rgba(255,180,0,.5)",
            color: "#f9c840",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".14em",
            padding: "2px 7px",
            borderRadius: 4,
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          MOC
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,.6)",
            lineHeight: 1.72,
          }}
        >
          実際の実装では
          <strong style={{ color: "rgba(255,255,255,.85)" }}>
            ディープリンクで自動分岐
          </strong>
          します。デモ確認用として手動で選択できます。
        </div>
      </div>
      <div
        style={{
          width: "100%",
          padding: "28px 22px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
        }}
      >
        <GiftIllSVG />
        <div
          style={{
            textAlign: "center",
            animation: "fadeUp .45s ease forwards",
          }}
        >
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: DRUG.text,
              lineHeight: 1.45,
            }}
          >
            特典をゲットしよう
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 13,
              color: DRUG.sub,
              lineHeight: 1.88,
            }}
          >
            デモルートを選択してください
          </div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <BranchBtn
            label="アプリインストール済みルート"
            sub="ネイティブアプリ内で動作"
            color={DRUG.red}
            onClick={() => onSelect(true)}
            icon={<PhoneIllSVG size={28} />}
            filled
          />
          <BranchBtn
            label="アプリなしルート"
            sub="ブラウザ（Web）で動作"
            color="#1a3f7a"
            onClick={() => onSelect(false)}
            icon={<GlobeIllSVG size={28} />}
            filled={false}
          />
        </div>
      </div>
    </div>
  );
}

function BranchBtn({ label, sub, color, onClick, icon, filled }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "15px 18px",
        borderRadius: 16,
        fontSize: 14,
        fontWeight: 700,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        textAlign: "left",
        fontFamily: "'Noto Sans JP',sans-serif",
        background: filled ? color : "white",
        color: filled ? "white" : color,
        border: filled ? "none" : "2px solid " + color,
        boxShadow: filled
          ? "0 8px 24px " + color + "55"
          : "0 3px 12px rgba(0,0,0,.07)",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          flexShrink: 0,
          background: filled ? "rgba(255,255,255,.18)" : color + "14",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: filled ? "white" : color,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.4 }}>
          {label}
        </div>
        <div
          style={{ fontSize: 11, opacity: 0.72, marginTop: 2, fontWeight: 400 }}
        >
          {sub}
        </div>
      </div>
    </button>
  );
}

function AdScr({ time, showSkip, onSkip }) {
  const pct = Math.max(0, (time / 15) * 100);
  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        background: "#fffcf5",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          flex: 1,
          background: "linear-gradient(162deg,#fff8ec,#ffe5ae,#ffc940)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: "0 32px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -70,
            right: -55,
            width: 230,
            height: 230,
            borderRadius: "50%",
            background: "rgba(255,180,50,.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -50,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,120,20,.13)",
          }}
        />
        <ShampooIllSVG />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "#a84800",
              letterSpacing: ".18em",
              marginBottom: 5,
            }}
          >
            NEW ARRIVAL
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: "#1e0800",
              lineHeight: 1.35,
            }}
          >
            毎日のケアに
            <br />
            プレミアムシャンプー
          </div>
          <div
            style={{
              marginTop: 12,
              display: "inline-block",
              background: DRUG.red,
              color: "white",
              padding: "7px 16px",
              borderRadius: 22,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            新商品販売中！ぜひお買い求めください！
          </div>
        </div>
      </div>
      <div
        style={{
          background: "white",
          padding: "10px 20px",
          borderTop: "1px solid #eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: "#b0aba4", marginBottom: 1 }}>
            提供：ドラッグストアA
          </div>
          <div style={{ fontSize: 12, color: DRUG.text, fontWeight: 600 }}>
            プレミアムヘアケアシリーズ
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 70,
              height: 4,
              background: "#ede7de",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: pct + "%",
                background: DRUG.red,
                borderRadius: 2,
                transition: "width 1s linear",
              }}
            />
          </div>
          <span style={{ fontSize: 12, color: "#aaa", minWidth: 20 }}>
            {time}s
          </span>
        </div>
      </div>
      {showSkip && (
        <button
          onClick={onSkip}
          style={{
            position: "absolute",
            bottom: 60,
            right: 16,
            background: "rgba(0,0,0,.72)",
            color: "white",
            border: "none",
            padding: "10px 22px",
            borderRadius: 24,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            animation: "fadeUp .3s ease forwards",
            fontFamily: "'Noto Sans JP',sans-serif",
          }}
        >
          スキップ
        </button>
      )}
    </div>
  );
}

function LotteryScr({ phase, points }) {
  const wheelRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({ angle: 0, speed: 0, mode: "idle" });
  const stopping = phase === "stopping";

  useEffect(() => {
    if (phase === "spinning") {
      stateRef.current.speed = 16;
      stateRef.current.mode = "spin";
      const tick = () => {
        const s = stateRef.current;
        s.angle = (s.angle + s.speed) % 36000;
        if (wheelRef.current) {
          wheelRef.current.style.transform = "rotate(" + s.angle + "deg)";
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    if (phase === "stopping") {
      stateRef.current.mode = "stop";
      cancelAnimationFrame(rafRef.current);
      const decel = () => {
        const s = stateRef.current;
        s.speed = s.speed * 0.962;
        s.angle = s.angle + s.speed;
        if (wheelRef.current) {
          wheelRef.current.style.transform = "rotate(" + s.angle + "deg)";
        }
        if (s.speed > 0.25) {
          rafRef.current = requestAnimationFrame(decel);
        }
      };
      rafRef.current = requestAnimationFrame(decel);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  const SEGS = [
    { color: "#ff5c8d", label: "3pt" },
    { color: "#ff9f1c", label: "5pt" },
    { color: "#2ec4b6", label: "10pt" },
    { color: "#e040fb", label: "3pt" },
    { color: "#ff5c8d", label: "5pt" },
    { color: "#ffeb3b", label: "3pt" },
    { color: "#ff9f1c", label: "10pt" },
    { color: "#2ec4b6", label: "5pt" },
  ];

  const DOTS = [
    { x: 8, y: 14 },
    { x: 88, y: 5 },
    { x: 55, y: 8 },
    { x: 20, y: 72 },
    { x: 72, y: 78 },
    { x: 90, y: 44 },
    { x: 36, y: 90 },
    { x: 5, y: 50 },
    { x: 62, y: 20 },
    { x: 15, y: 35 },
    { x: 80, y: 25 },
    { x: 45, y: 95 },
    { x: 95, y: 68 },
    { x: 28, y: 58 },
    { x: 70, y: 55 },
  ];

  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(160deg,#ffe066,#ffb347)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "16px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {DOTS.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 12 + ((i * 7) % 16),
            height: 12 + ((i * 7) % 16),
            borderRadius: "50%",
            background: "rgba(255,255,255,.14)",
            top: d.y + "%",
            left: d.x + "%",
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          fontSize: 34,
          fontWeight: 900,
          color: "white",
          letterSpacing: ".06em",
          textShadow: "0 3px 0 rgba(0,0,0,.18)",
          animation: "fadeUp .4s ease forwards",
          zIndex: 2,
        }}
      >
        {stopping ? "当たり！" : "START!"}
      </div>

      <div style={{ position: "relative", width: 240, height: 240, zIndex: 2 }}>
        <div
          style={{
            position: "absolute",
            top: -12,
            left: -12,
            right: -12,
            bottom: -12,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#e91e96,#c2185b)",
            boxShadow: "0 8px 32px rgba(233,30,150,.5)",
          }}
        >
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: i % 2 === 0 ? "#fff176" : "white",
                boxShadow: i % 2 === 0 ? "0 0 6px #fff176" : "0 0 6px white",
                transform:
                  "rotate(" +
                  i * 22.5 +
                  "deg) translateY(-118px) translateX(-5px)",
                animation: "lightBlink .8s ease " + i * 0.05 + "s infinite",
              }}
            />
          ))}
        </div>

        <div
          ref={wheelRef}
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <svg width="240" height="240" viewBox="0 0 240 240">
            {SEGS.map((seg, i) => {
              const n = SEGS.length;
              const a1 = (((360 / n) * i - 90) * Math.PI) / 180;
              const a2 = (((360 / n) * (i + 1) - 90) * Math.PI) / 180;
              const x1 = 120 + 108 * Math.cos(a1);
              const y1 = 120 + 108 * Math.sin(a1);
              const x2 = 120 + 108 * Math.cos(a2);
              const y2 = 120 + 108 * Math.sin(a2);
              const mx = 120 + 70 * Math.cos((a1 + a2) / 2);
              const my = 120 + 70 * Math.sin((a1 + a2) / 2);
              return (
                <g key={i}>
                  <path
                    d={
                      "M120,120 L" +
                      x1 +
                      "," +
                      y1 +
                      " A108,108 0 0,1 " +
                      x2 +
                      "," +
                      y2 +
                      " Z"
                    }
                    fill={seg.color}
                  />
                  <line
                    x1="120"
                    y1="120"
                    x2={x1}
                    y2={y1}
                    stroke="white"
                    strokeWidth="2"
                  />
                  <text
                    x={mx}
                    y={my + 5}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight="900"
                    fill="white"
                  >
                    {seg.label}
                  </text>
                </g>
              );
            })}
            <circle cx="120" cy="120" r="24" fill="#333" />
            <circle cx="120" cy="120" r="17" fill="#555" />
            <text
              x="120"
              y="126"
              textAnchor="middle"
              fontSize="15"
              fontWeight="900"
              fill="#ffeb3b"
            >
              *
            </text>
          </svg>
        </div>

        <div
          style={{
            position: "absolute",
            top: -4,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 10,
          }}
        >
          <svg width="26" height="30" viewBox="0 0 26 30">
            <polygon points="13,28 1,2 25,2" fill="#29b6f6" />
            <circle cx="13" cy="5" r="5" fill="white" />
          </svg>
        </div>
      </div>

      {stopping ? (
        <div
          style={{
            background: "white",
            borderRadius: 24,
            padding: "12px 36px",
            boxShadow: "0 8px 28px rgba(0,0,0,.18)",
            animation: "starPop .5s ease forwards",
            zIndex: 2,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#e91e96",
              fontWeight: 700,
              letterSpacing: ".1em",
              marginBottom: 2,
            }}
          >
            来店ポイント
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 900,
              color: "#1a1a1a",
              lineHeight: 1,
            }}
          >
            {points}
            <span style={{ fontSize: 18, color: "#888", marginLeft: 4 }}>
              pt
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            color: "rgba(255,255,255,.72)",
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          ルーレットを回しています...
        </div>
      )}
    </div>
  );
}

function PrizeScr({ points, hasApp, theme, onNext }) {
  const confs = Array.from({ length: 18 }, (_, i) => ({
    x: 3 + ((i * 17 + 7) % 94),
    delay: (i * 0.13) % 2.4,
    color: ["#f4c430", "#e03030", "#50bfa0", "#4488d0", "#b06cd0", "#e07840"][
      i % 6
    ],
    size: 5 + (i % 7),
    round: i % 3 === 0,
  }));
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(168deg," + theme.bg + ",#fff)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {confs.map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: c.x + "%",
            width: c.size,
            height: c.size,
            background: c.color,
            borderRadius: c.round ? "50%" : 2,
            animation: "confettiFall 2.5s ease " + c.delay + "s infinite",
            opacity: 0,
            zIndex: 0,
          }}
        />
      ))}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          gap: 20,
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <div style={{ animation: "fadeUp .45s ease forwards" }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#c0bcb4",
              letterSpacing: ".14em",
              marginBottom: 4,
            }}
          >
            CONGRATULATIONS
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: DRUG.text }}>
            おめでとうございます！
          </div>
        </div>
        <PointsCard points={points} theme={theme} />
        <div
          style={{
            fontSize: 13,
            color: DRUG.sub,
            lineHeight: 1.88,
            animation: "fadeUp .6s ease forwards",
          }}
        >
          {hasApp ? (
            <span>
              ドラッグストアAの来店ポイントとして
              <br />
              付与されます
            </span>
          ) : (
            <span>
              アプリをダウンロードして
              <br />
              ポイントを受け取ろう！
            </span>
          )}
        </div>
      </div>
      <div style={{ padding: "0 24px 52px", zIndex: 1 }}>
        <PrimaryBtn theme={theme} onClick={onNext}>
          {hasApp ? "特典を受け取る" : "アプリをダウンロードして受け取る"}
        </PrimaryBtn>
      </div>
    </div>
  );
}

function ReceivedScr({ points, theme, onNext }) {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(168deg," + theme.bg + ",#fff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        gap: 20,
        textAlign: "center",
      }}
    >
      <div style={{ animation: "popIn .55s ease forwards" }}>
        <CheckIllSVG color={theme.primary} />
      </div>
      <div style={{ animation: "fadeUp .5s ease forwards" }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: theme.primary,
            opacity: 0.75,
            letterSpacing: ".06em",
            marginBottom: 4,
          }}
        >
          来店ポイント
        </div>
        <div
          style={{
            fontSize: 25,
            fontWeight: 900,
            color: theme.primary,
            lineHeight: 1.42,
          }}
        >
          {points}ポイントを
          <br />
          受け取りました！
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 13,
            color: DRUG.sub,
            lineHeight: 1.88,
          }}
        >
          ポイントはアプリのマイページ
          <br />
          から確認できます
        </div>
      </div>
      <div style={{ width: "100%", marginTop: 6 }}>
        <PrimaryBtn theme={theme} onClick={onNext}>
          クーポン一覧へ
        </PrimaryBtn>
      </div>
    </div>
  );
}

function AppTopScr({ points, theme, onNext }) {
  const coupons = [
    {
      color: "#fff3e0",
      border: "#ffb300",
      tag: "本日限定",
      title: "日用品 ポイント15倍",
      sub: "対象商品のみ",
    },
    {
      color: "#fce4ec",
      border: "#e91e63",
      tag: "NEW",
      title: "化粧品・医薬品 10%OFF",
      sub: "1人1回限り",
    },
    {
      color: "#e8f5e9",
      border: "#43a047",
      tag: "期間限定",
      title: "食品 ポイント5倍",
      sub: "今月末まで",
    },
  ];
  const specialCoupon = {
    title: "プレミアムシャンプー 20%OFF",
    sub: "来店キャンペーン対象商品限定",
    exp: "本日23:59まで",
  };
  return (
    <div
      style={{
        flex: 1,
        background: DRUG.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      <div
        style={{
          margin: "12px 14px 0",
          background: "white",
          borderRadius: 16,
          padding: "14px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,.07)",
          border: "1px solid " + DRUG.border,
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}
        >
          <svg width="230" height="54" viewBox="0 0 230 54" fill="none">
            {Array.from({ length: 46 }, (_, i) => (
              <rect
                key={i}
                x={i * 5}
                y="0"
                width={i % 4 === 0 ? 3 : i % 3 === 0 ? 2 : 1.2}
                height="52"
                fill="#111"
                rx=".3"
              />
            ))}
          </svg>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 11, color: DRUG.sub }}>0100 8322 5150 9</div>
          <div
            style={{
              fontSize: 11,
              color: DRUG.red,
              border: "1px solid " + DRUG.red,
              padding: "2px 8px",
              borderRadius: 4,
              fontWeight: 600,
            }}
          >
            コピー
          </div>
        </div>
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid " + DRUG.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#e8e8e8",
                border: "2px solid #c0c0c0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                color: "#666",
              }}
            >
              一般
            </div>
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: DRUG.text,
                  lineHeight: 1,
                }}
              >
                {447 + points}{" "}
                <span
                  style={{ fontSize: 13, color: DRUG.sub, fontWeight: 400 }}
                >
                  pt
                </span>
              </div>
              <div style={{ fontSize: 10, color: DRUG.red, marginTop: 1 }}>
                +{points}pt（来店ポイント）が加算されました
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          margin: "14px 14px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: DRUG.text }}>
          おすすめクーポン
        </div>
        <div
          style={{
            fontSize: 12,
            color: DRUG.red,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          一覧はこちら
        </div>
      </div>

      {/* Special campaign coupon */}
      <div
        style={{
          margin: "10px 14px 0",
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 6px 24px rgba(224,48,48,.22)",
        }}
      >
        {/* Header badge */}
        <div
          style={{
            background: "linear-gradient(90deg,#b81a1a,#e03030)",
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: DRUG.gold,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              color: DRUG.gold,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: ".12em",
            }}
          >
            来店キャンペーン参加者限定
          </span>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: DRUG.gold,
              flexShrink: 0,
            }}
          />
        </div>
        {/* Body */}
        <div
          style={{
            background: "white",
            padding: "14px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "2px solid #e03030",
            borderTop: "none",
            borderRadius: "0 0 18px 18px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: DRUG.red,
                lineHeight: 1.1,
              }}
            >
              {specialCoupon.title}
            </div>
            <div style={{ fontSize: 12, color: DRUG.sub, marginTop: 4 }}>
              {specialCoupon.sub}
            </div>
            <div
              style={{
                marginTop: 6,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                background: "#fff3f3",
                border: "1px solid #fcc",
                borderRadius: 6,
                padding: "2px 8px",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: DRUG.red,
                }}
              />
              <span style={{ fontSize: 10, color: DRUG.red, fontWeight: 700 }}>
                {specialCoupon.exp}
              </span>
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg,#e03030,#f25050)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(224,48,48,.35)",
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect
                  x="2"
                  y="6"
                  width="24"
                  height="16"
                  rx="3"
                  stroke="white"
                  strokeWidth="1.6"
                  fill="none"
                />
                <circle
                  cx="2"
                  cy="14"
                  r="3.5"
                  fill="#e03030"
                  stroke="white"
                  strokeWidth="1.4"
                />
                <circle
                  cx="26"
                  cy="14"
                  r="3.5"
                  fill="#e03030"
                  stroke="white"
                  strokeWidth="1.4"
                />
                <line
                  x1="10"
                  y1="9"
                  x2="10"
                  y2="19"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
                <line
                  x1="14"
                  y1="10"
                  x2="14"
                  y2="18"
                  stroke="white"
                  strokeWidth="1.8"
                />
                <line
                  x1="18"
                  y1="9"
                  x2="18"
                  y2="19"
                  stroke="white"
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
              </svg>
            </div>
            <div
              style={{
                fontSize: 9,
                color: DRUG.red,
                fontWeight: 700,
                marginTop: 4,
              }}
            >
              タップして使う
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          padding: "10px 14px 14px",
          scrollbarWidth: "none",
        }}
      >
        {coupons.map((c, i) => (
          <div
            key={i}
            style={{
              minWidth: 128,
              borderRadius: 14,
              background: c.color,
              border: "1.5px solid " + c.border,
              padding: "10px 12px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "inline-block",
                background: c.border,
                color: "white",
                fontSize: 9,
                fontWeight: 700,
                padding: "1px 6px",
                borderRadius: 3,
                marginBottom: 6,
              }}
            >
              {c.tag}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: DRUG.text,
                lineHeight: 1.4,
              }}
            >
              {c.title}
            </div>
            <div style={{ fontSize: 10, color: DRUG.sub, marginTop: 4 }}>
              {c.sub}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: "4px 14px 20px" }}>
        <PrimaryBtn theme={theme} onClick={onNext}>
          クーポン一覧をみる
        </PrimaryBtn>
      </div>
    </div>
  );
}

function AppStoreScr({ theme, onNext }) {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(168deg,#eaeff8,#fff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px",
        gap: 22,
        textAlign: "center",
      }}
    >
      <div style={{ animation: "popIn .5s ease forwards" }}>
        <DownloadIllSVG color={theme.primary} />
      </div>
      <div style={{ animation: "fadeUp .45s ease forwards" }}>
        <div style={{ fontSize: 21, fontWeight: 900, color: DRUG.text }}>
          App Storeに移動します
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 13,
            color: DRUG.sub,
            lineHeight: 1.88,
          }}
        >
          ドラッグストアAアプリをダウンロードして
          <br />
          ポイントを受け取ってください
        </div>
      </div>
      <div
        style={{
          width: "100%",
          padding: "15px 18px",
          background: "white",
          borderRadius: 20,
          border: "1px solid #e8e4de",
          display: "flex",
          alignItems: "center",
          gap: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,.07)",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 14,
            background: DRUG.red,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 900, color: DRUG.gold }}>
            A
          </span>
        </div>
        <div style={{ textAlign: "left", flex: 1 }}>
          <div style={{ fontWeight: 700, color: DRUG.text, fontSize: 14 }}>
            ドラッグストアA
          </div>
          <div style={{ fontSize: 11, color: DRUG.sub, marginTop: 2 }}>
            ドラッグストア・ポイント管理
          </div>
          <div style={{ fontSize: 12, color: "#f4a820", marginTop: 2 }}>
            ★★★★★ 4.7
          </div>
        </div>
        <button
          onClick={onNext}
          style={{
            padding: "9px 20px",
            background: theme.primary,
            color: "white",
            border: "none",
            borderRadius: 22,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            flexShrink: 0,
            fontFamily: "'Noto Sans JP',sans-serif",
          }}
        >
          入手
        </button>
      </div>
    </div>
  );
}

function OsAppStoreScr({ theme, onNext }) {
  const [instPhase, setInstPhase] = useState("idle");
  useEffect(() => {
    if (instPhase !== "installing") return;
    const t = setTimeout(() => setInstPhase("done"), 2300);
    return () => clearTimeout(t);
  }, [instPhase]);
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "#f2f2f7",
        overflow: "auto",
      }}
    >
      <div
        style={{
          background: "linear-gradient(160deg,#0a84ff,#0055d4)",
          padding: "12px 18px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ color: "white", fontSize: 18, fontWeight: 800 }}>
          App Store
        </div>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle
              cx="9"
              cy="9"
              r="7.5"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <text
              x="9"
              y="13"
              textAnchor="middle"
              fontSize="10"
              fill="white"
              fontWeight="700"
            >
              A
            </text>
          </svg>
        </div>
      </div>
      <div style={{ padding: "10px 14px 6px", background: "#f2f2f7" }}>
        <div
          style={{
            background: "#e5e5ea",
            borderRadius: 12,
            padding: "8px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="6" cy="6" r="4.5" stroke="#8e8e93" strokeWidth="1.5" />
            <line
              x1="9.5"
              y1="9.5"
              x2="13"
              y2="13"
              stroke="#8e8e93"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 13, color: "#8e8e93" }}>
            ゲーム、App、ストーリーなど
          </span>
        </div>
      </div>
      <div
        style={{
          margin: "8px 14px",
          background: "white",
          borderRadius: 18,
          padding: "18px 16px",
          boxShadow: "0 2px 12px rgba(0,0,0,.08)",
          animation: "slideRight .4s ease forwards",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: DRUG.red,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 14px rgba(224,48,48,.35)",
            }}
          >
            <span style={{ fontSize: 36, fontWeight: 900, color: DRUG.gold }}>
              A
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1c1c1e" }}>
              ドラッグストアA
            </div>
            <div style={{ fontSize: 12, color: "#8e8e93", marginTop: 2 }}>
              ショッピング・ポイント管理
            </div>
            <div style={{ fontSize: 12, color: "#ff9500", marginTop: 4 }}>
              ★★★★★ <span style={{ color: "#8e8e93" }}>4.7 (1.2万件)</span>
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid #f2f2f7",
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {[
            ["評価", "4.7"],
            ["レビュー", "1.2万"],
            ["年齢", "4+"],
            ["カテゴリ", "ショッピング"],
          ].map(([k, v]) => (
            <div key={k} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#8e8e93", marginBottom: 2 }}>
                {k}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#1c1c1e" }}>
                {v}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          {instPhase === "idle" && (
            <button
              onClick={() => setInstPhase("installing")}
              style={{
                width: "100%",
                padding: "13px",
                background: "#0a84ff",
                color: "white",
                border: "none",
                borderRadius: 14,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Noto Sans JP',sans-serif",
              }}
            >
              入手
            </button>
          )}
          {instPhase === "installing" && (
            <div>
              <div
                style={{
                  background: "#e5e5ea",
                  borderRadius: 8,
                  height: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background: "#0a84ff",
                    borderRadius: 8,
                    animation: "installProgress 2.2s ease forwards",
                  }}
                />
              </div>
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#8e8e93",
                  marginTop: 7,
                }}
              >
                インストール中...
              </div>
            </div>
          )}
          {instPhase === "done" && (
            <div style={{ animation: "popIn .4s ease forwards" }}>
              <button
                onClick={onNext}
                style={{
                  width: "100%",
                  padding: "13px",
                  background: "linear-gradient(135deg,#34c759,#2da44e)",
                  color: "white",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Noto Sans JP',sans-serif",
                  boxShadow: "0 6px 18px rgba(52,199,89,.4)",
                }}
              >
                開く
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ padding: "4px 14px 20px" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1c1c1e",
            marginBottom: 10,
          }}
        >
          プレビュー
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {["#fff3e0", "#fce4ec", "#e8f5e9"].map((bg, i) => (
            <div
              key={i}
              style={{
                minWidth: 100,
                height: 176,
                borderRadius: 14,
                background: bg,
                border: "1px solid #e5e5ea",
                flexShrink: 0,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EndScr({ onReset }) {
  return (
    <div
      style={{
        flex: 1,
        background: "linear-gradient(168deg,#faf6ee,#f0e8d4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 30px",
        gap: 18,
        textAlign: "center",
      }}
    >
      <div style={{ animation: "popIn .55s ease forwards" }}>
        <ThankYouIllSVG />
      </div>
      <div style={{ animation: "fadeUp .5s ease forwards" }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#c8a058",
            letterSpacing: ".2em",
            marginBottom: 8,
          }}
        >
          THANK YOU
        </div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#2c1e08",
            lineHeight: 1.48,
          }}
        >
          ご参加ありがとう
          <br />
          ございました
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 14,
            color: "#8c7c64",
            lineHeight: 1.88,
          }}
        >
          お買い物をお楽しみください
        </div>
      </div>
      <div
        style={{ width: 36, height: 2, background: "#c8a058", borderRadius: 1 }}
      />
      <div style={{ fontSize: 11, color: "#c0b098", letterSpacing: ".08em" }}>
        Powered by Supership TouchGift
      </div>
      <button
        onClick={onReset}
        style={{
          marginTop: 4,
          padding: "14px 38px",
          background: "linear-gradient(135deg,#3a2810,#6b4820)",
          color: "white",
          border: "none",
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          boxShadow: "0 8px 26px rgba(50,30,8,.36)",
          fontFamily: "'Noto Sans JP',sans-serif",
          letterSpacing: ".06em",
        }}
      >
        はじめから体験する
      </button>
    </div>
  );
}

function PointsCard({ points, theme }) {
  return (
    <div
      style={{
        width: 188,
        height: 188,
        borderRadius: 30,
        background:
          "linear-gradient(148deg," + theme.primary + "," + theme.light + ")",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 20px 56px " + theme.shadow,
        animation: "popIn .6s ease forwards",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "9%",
          left: "7%",
          width: "38%",
          height: "22%",
          background: "rgba(255,255,255,.2)",
          borderRadius: "50%",
          transform: "rotate(-30deg)",
          animation: "shimmer 2.2s ease-in-out infinite",
        }}
      />
      <div
        style={{ fontSize: 70, fontWeight: 900, color: "white", lineHeight: 1 }}
      >
        {points}
      </div>
      <div
        style={{
          fontSize: 16,
          color: "rgba(255,255,255,.88)",
          fontWeight: 700,
          letterSpacing: ".06em",
        }}
      >
        ポイント
      </div>
    </div>
  );
}

function PrimaryBtn({ onClick, theme, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        padding: "17px",
        background:
          "linear-gradient(135deg," + theme.primary + "," + theme.light + ")",
        color: "white",
        border: "none",
        borderRadius: 20,
        fontSize: 15,
        fontWeight: 700,
        cursor: "pointer",
        boxShadow: "0 10px 28px " + theme.shadow,
        fontFamily: "'Noto Sans JP',sans-serif",
        letterSpacing: ".04em",
      }}
    >
      {children}
    </button>
  );
}

function NfcIllSVG() {
  return (
    <svg width="108" height="108" viewBox="0 0 108 108" fill="none">
      <rect
        x="36"
        y="14"
        width="36"
        height="62"
        rx="7"
        stroke="#50c0ff"
        strokeWidth="2"
        fill="rgba(80,192,255,.06)"
      />
      <rect
        x="44"
        y="68"
        width="20"
        height="4"
        rx="2"
        fill="#50c0ff"
        opacity=".42"
      />
      <rect
        x="40"
        y="22"
        width="28"
        height="36"
        rx="3"
        fill="rgba(80,192,255,.1)"
        stroke="#50c0ff"
        strokeWidth="1.2"
      />
      <path
        d="M46 40 Q44 36,44 40 Q44 44,46 40"
        stroke="#50c0ff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M50 40 Q48 34,48 40 Q48 46,50 40"
        stroke="#50c0ff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M54 40 Q52 32,52 40 Q52 48,54 40"
        stroke="#50c0ff"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M28 54 Q24 44,24 54 Q24 64,28 54"
        stroke="#50c0ff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M20 54 Q14 40,14 54 Q14 68,20 54"
        stroke="#50c0ff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".28"
      />
      <path
        d="M80 54 Q84 44,84 54 Q84 64,80 54"
        stroke="#50c0ff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".55"
      />
      <path
        d="M88 54 Q94 40,94 54 Q94 68,88 54"
        stroke="#50c0ff"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".28"
      />
    </svg>
  );
}

function GiftIllSVG() {
  return (
    <svg width="80" height="80" viewBox="0 0 84 84" fill="none">
      <rect
        x="10"
        y="35"
        width="64"
        height="42"
        rx="5"
        fill="#fce8e8"
        stroke={DRUG.red}
        strokeWidth="1.6"
      />
      <rect x="8" y="25" width="68" height="14" rx="5" fill={DRUG.red} />
      <rect x="37" y="25" width="10" height="52" fill={DRUG.gold} />
      <rect x="8" y="31" width="68" height="4" fill="rgba(240,168,0,.6)" />
      <path
        d="M42 25 C42 25 29 20 27 12 C25 4 36 2 42 12 C48 2 59 4 57 12 C55 20 42 25 42 25Z"
        fill={DRUG.gold}
      />
      <ellipse
        cx="36"
        cy="13"
        rx="5"
        ry="3"
        fill="rgba(255,255,255,0.28)"
        transform="rotate(-22,36,13)"
      />
    </svg>
  );
}

function PhoneIllSVG({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="currentColor">
      <rect
        x="6"
        y="2"
        width="20"
        height="28"
        rx="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect x="13" y="26" width="6" height="2" rx="1" opacity=".45" />
      <rect x="9" y="8" width="6" height="6" rx="2" opacity=".5" />
      <rect x="17" y="8" width="6" height="6" rx="2" opacity=".5" />
      <rect x="9" y="16" width="6" height="6" rx="2" opacity=".5" />
      <rect x="17" y="16" width="6" height="6" rx="2" opacity=".5" />
    </svg>
  );
}

function GlobeIllSVG({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle
        cx="16"
        cy="16"
        r="13"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M16 3 C16 3 11.5 9 11.5 16 C11.5 23 16 29 16 29"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M16 3 C16 3 20.5 9 20.5 16 C20.5 23 16 29 16 29"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <line
        x1="3"
        y1="16"
        x2="29"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="4.5"
        y1="11"
        x2="27.5"
        y2="11"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".45"
      />
      <line
        x1="4.5"
        y1="21"
        x2="27.5"
        y2="21"
        stroke="currentColor"
        strokeWidth="1"
        opacity=".45"
      />
    </svg>
  );
}

function ShampooIllSVG() {
  return (
    <svg
      width="90"
      height="152"
      viewBox="0 0 90 152"
      fill="none"
      style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,.18))" }}
    >
      <rect x="41" y="0" width="8" height="15" rx="4" fill="#5d4037" />
      <rect x="36" y="13" width="18" height="9" rx="4" fill="#4e342e" />
      <rect x="27" y="20" width="36" height="21" rx="6" fill="#5d4037" />
      <path
        d="M17 46 Q15 57 15 74 L15 128 Q15 140 29 140 L61 140 Q75 140 75 128 L75 74 Q75 57 73 46 L62 30 Q50 24 28 30 Z"
        fill="#ff8f00"
      />
      <path
        d="M25 46 Q23 60 23 74"
        stroke="rgba(255,255,255,.38)"
        strokeWidth="5.5"
        strokeLinecap="round"
      />
      <rect
        x="22"
        y="66"
        width="46"
        height="58"
        rx="7"
        fill="white"
        opacity=".92"
      />
      <rect
        x="27"
        y="72"
        width="36"
        height="4.5"
        rx="2.2"
        fill="#5d4037"
        opacity=".5"
      />
      <rect
        x="30"
        y="80"
        width="30"
        height="3"
        rx="1.5"
        fill="#b0a090"
        opacity=".4"
      />
      <rect
        x="24"
        y="94"
        width="42"
        height="26"
        rx="5.5"
        fill={DRUG.red}
        opacity=".9"
      />
      <rect
        x="29"
        y="99"
        width="32"
        height="3.5"
        rx="1.8"
        fill="white"
        opacity=".85"
      />
      <rect
        x="32"
        y="106"
        width="26"
        height="3"
        rx="1.5"
        fill="white"
        opacity=".62"
      />
    </svg>
  );
}

function CheckIllSVG({ color }) {
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
      <circle cx="46" cy="46" r="42" fill={color} opacity=".07" />
      <circle cx="46" cy="46" r="34" fill={color} opacity=".12" />
      <circle cx="46" cy="46" r="25" fill={color} />
      <path
        d="M 30 46 L 41 58 L 63 32"
        stroke="white"
        strokeWidth="3.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="64"
        style={{
          animation: "checkDraw .65s ease .3s forwards",
          strokeDashoffset: 64,
        }}
      />
    </svg>
  );
}

function DownloadIllSVG({ color }) {
  return (
    <svg width="92" height="92" viewBox="0 0 92 92" fill="none">
      <circle cx="46" cy="46" r="42" fill={color} opacity=".07" />
      <circle cx="46" cy="46" r="30" fill={color} opacity=".11" />
      <rect
        x="32"
        y="27"
        width="28"
        height="38"
        rx="5.5"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <rect
        x="38"
        y="58"
        width="16"
        height="3.5"
        rx="1.8"
        fill={color}
        opacity=".35"
      />
      <path
        d="M46 34 L46 50"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M39 44 L46 51 L53 44"
        stroke={color}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ThankYouIllSVG() {
  return (
    <svg width="136" height="116" viewBox="0 0 136 116" fill="none">
      {[
        [14, 10],
        [122, 9],
        [12, 96],
        [120, 88],
        [68, 5],
      ].map(([x, y], i) => (
        <g
          key={i}
          transform={"translate(" + x + "," + y + ")"}
          opacity={0.32 + i * 0.1}
        >
          <line
            x1="0"
            y1="-8"
            x2="0"
            y2="8"
            stroke="#c9943a"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1="-8"
            y1="0"
            x2="8"
            y2="0"
            stroke="#c9943a"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <line
            x1="-5.5"
            y1="-5.5"
            x2="5.5"
            y2="5.5"
            stroke="#c9943a"
            strokeWidth="1"
            strokeLinecap="round"
            opacity=".5"
          />
          <line
            x1="5.5"
            y1="-5.5"
            x2="-5.5"
            y2="5.5"
            stroke="#c9943a"
            strokeWidth="1"
            strokeLinecap="round"
            opacity=".5"
          />
        </g>
      ))}
      <path
        d="M28 96 Q22 76 30 60 Q42 46 68 48 Q94 46 106 60 Q114 76 108 96"
        fill="#fce8cc"
        stroke="#d4a868"
        strokeWidth="1.5"
      />
      <rect
        x="40"
        y="36"
        width="56"
        height="44"
        rx="5"
        fill="#fce8cc"
        stroke="#c9943a"
        strokeWidth="1.6"
      />
      <rect x="38" y="26" width="60" height="14" rx="5" fill={DRUG.red} />
      <rect x="63" y="26" width="10" height="54" fill={DRUG.gold} />
      <rect x="38" y="30" width="60" height="5" fill="rgba(240,168,0,.65)" />
      <path
        d="M68 26 C68 26 55 20 53 13 C51 6 60 4 68 13 C76 4 85 6 83 13 C81 20 68 26 68 26Z"
        fill={DRUG.gold}
      />
    </svg>
  );
}

function NavIconSVG({ type, c = "white" }) {
  if (type === "search")
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="9" cy="9" r="6.5" stroke={c} strokeWidth="1.8" />
        <line
          x1="13.5"
          y1="13.5"
          x2="19.5"
          y2="19.5"
          stroke={c}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  if (type === "bell")
    return (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path
          d="M11 3 C7.5 3 5 5.8 5 9.5 L5 14.5 L3 16.5 L19 16.5 L17 14.5 L17 9.5 C17 5.8 14.5 3 11 3Z"
          stroke={c}
          strokeWidth="1.8"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d="M9 16.5 C9 17.7 9.9 18.5 11 18.5 C12.1 18.5 13 17.7 13 16.5"
          stroke={c}
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    );
  return (
    <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
      <rect
        x="1"
        y="3"
        width="26"
        height="16"
        rx="3.5"
        stroke={c}
        strokeWidth="1.5"
        fill="none"
      />
      <text
        x="14"
        y="15"
        textAnchor="middle"
        fontSize="8"
        fontWeight="700"
        fill={c}
      >
        POINT
      </text>
    </svg>
  );
}

function TabIconSVG({ type, active }) {
  const c = active ? DRUG.red : "#9e9990";
  if (type === "barcode")
    return (
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        {[2, 5, 8, 10, 13, 16, 19].map((x, i) => (
          <line
            key={i}
            x1={x}
            y1="2"
            x2={x}
            y2="16"
            stroke={c}
            strokeWidth={i % 3 === 0 ? 2 : 1.2}
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  if (type === "topics")
    return (
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <rect x="2" y="3" width="9" height="6" rx="1.5" fill={c} opacity=".9" />
        <rect
          x="13"
          y="3"
          width="7"
          height="6"
          rx="1.5"
          fill={c}
          opacity=".55"
        />
        <rect
          x="2"
          y="11"
          width="7"
          height="5"
          rx="1.5"
          fill={c}
          opacity=".55"
        />
        <rect
          x="11"
          y="11"
          width="9"
          height="5"
          rx="1.5"
          fill={c}
          opacity=".9"
        />
      </svg>
    );
  if (type === "coupon")
    return (
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <rect
          x="2"
          y="4"
          width="18"
          height="10"
          rx="2.5"
          stroke={c}
          strokeWidth="1.6"
          fill="none"
        />
        <circle
          cx="2"
          cy="9"
          r="3"
          fill={active ? DRUG.bg : "#f7f5f2"}
          stroke={c}
          strokeWidth="1.6"
        />
        <circle
          cx="20"
          cy="9"
          r="3"
          fill={active ? DRUG.bg : "#f7f5f2"}
          stroke={c}
          strokeWidth="1.6"
        />
        <line
          x1="9"
          y1="6"
          x2="9"
          y2="12"
          stroke={c}
          strokeWidth="1.2"
          strokeDasharray="2,1.5"
        />
      </svg>
    );
  if (type === "book")
    return (
      <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
        <path
          d="M4 3 Q11 1 18 3 L18 15 Q11 13 4 15 Z"
          stroke={c}
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />
        <line x1="11" y1="2" x2="11" y2="14" stroke={c} strokeWidth="1.2" />
      </svg>
    );
  return (
    <svg width="22" height="18" viewBox="0 0 22 18" fill={c}>
      {[5, 11, 17].map((x) => (
        <circle key={x} cx={x} cy="9" r="2.2" />
      ))}
    </svg>
  );
}

function LockSVG({ size = 11 }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 11 15" fill="none">
      <rect x="1.5" y="6.5" width="8" height="8" rx="2" fill="#8c8880" />
      <path
        d="M3.5 6.5 V5 C3.5 3 7.5 3 7.5 5 V6.5"
        stroke="#8c8880"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function SigSVG({ c }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill={c}>
      <rect x="0" y="7" width="3" height="5" rx=".5" opacity=".9" />
      <rect x="4.5" y="4.5" width="3" height="7.5" rx=".5" opacity=".9" />
      <rect x="9" y="2" width="3" height="10" rx=".5" opacity=".9" />
      <rect x="13.5" y="0" width="2.5" height="12" rx=".5" opacity=".28" />
    </svg>
  );
}

function WifiSVG({ c }) {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
      <path
        d="M8 10 L8 10"
        stroke={c}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M5.5 7.5 Q8 5.5 10.5 7.5"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity=".9"
      />
      <path
        d="M3 5 Q8 1.5 13 5"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity=".55"
      />
      <path
        d="M0.5 2.5 Q8 -1.2 15.5 2.5"
        stroke={c}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        opacity=".28"
      />
    </svg>
  );
}

function BattSVG({ c }) {
  return (
    <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
      <rect
        x=".5"
        y="1.5"
        width="18"
        height="9"
        rx="2"
        stroke={c}
        strokeWidth="1.3"
        opacity=".8"
      />
      <rect x="2" y="3" width="12" height="6" rx="1" fill={c} opacity=".8" />
      <path
        d="M19.5 4.5 V7.5"
        stroke={c}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".5"
      />
    </svg>
  );
}
