import { useState, useEffect, useCallback } from "react";

const C = {
    bg: "#08080C", surface: "#12121A", surfaceLight: "#1A1A24",
    gold: "#C9A84C", goldLight: "#E8D5A3", goldDark: "#8B7332",
    text: "#F0EDE6", textMuted: "#7A7A8A", accent: "rgba(201,168,76,0.07)",
    border: "rgba(201,168,76,0.15)", borderSoft: "rgba(201,168,76,0.08)",
    green: "#2ECC71", blue: "#3498DB", red: "#E74C3C", orange: "#F39C12",
};

const fonts = {
    serif: "'Georgia', 'Palatino Linotype', 'Times New Roman', serif",
    sans: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
};

// --- REUSABLE COMPONENTS ---
const GoldLine = ({ w = 60, my = 16 }) => (
    <div style={{ width: w, height: 1.5, background: `linear-gradient(90deg, ${C.gold}, transparent)`, margin: `${my}px 0`, borderRadius: 2 }} />
);

const Badge = ({ children }) => (
    <span style={{ display: "inline-block", fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: C.gold, background: C.accent, border: `1px solid ${C.border}`, padding: "8px 20px", borderRadius: 2, fontFamily: fonts.sans }}>{children}</span>
);

const IconCircle = ({ icon, size = 44, color = C.gold }) => (
    <div style={{ width: size, height: size, borderRadius: "50%", background: `rgba(201,168,76,0.1)`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.42, flexShrink: 0, color }}>{icon}</div>
);

const Card = ({ children, style = {}, glow = false }) => (
    <div style={{ background: C.surface, border: `1px solid ${glow ? C.gold : C.borderSoft}`, borderRadius: 8, padding: 20, boxShadow: glow ? `0 0 30px rgba(201,168,76,0.08)` : "0 2px 12px rgba(0,0,0,0.3)", ...style }}>{children}</div>
);

const MockupFrame = ({ children, title = "CHRONOS", style = {} }) => (
    <div style={{ background: "#0E0E14", border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.5)", ...style }}>
        <div style={{ height: 36, background: "#0A0A10", borderBottom: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", padding: "0 14px", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
            <span style={{ fontSize: 14, color: C.textMuted, marginLeft: 12, letterSpacing: 1.5, fontFamily: fonts.sans }}>{title}</span>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
    </div>
);

const FlowStep = ({ num, label, icon, active = false }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
        <div style={{ width: 54, height: 54, borderRadius: "50%", background: active ? C.gold : C.surface, border: `1px solid ${active ? C.gold : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: active ? C.bg : C.gold, fontWeight: 700, fontFamily: fonts.sans }}>{icon || num}</div>
        <span style={{ fontSize: 14, color: active ? C.goldLight : C.textMuted, textAlign: "center", lineHeight: 1.4, maxWidth: 100, fontFamily: fonts.sans }}>{label}</span>
    </div>
);

const FlowArrow = () => (
    <div style={{ color: C.goldDark, fontSize: 14, marginTop: -10 }}>→</div>
);

const StatusPill = ({ label, color }) => (
    <span style={{ fontSize: 12, padding: "4px 13px", borderRadius: 10, background: `${color}18`, color, border: `1px solid ${color}30`, fontFamily: fonts.sans, letterSpacing: 0.5 }}>{label}</span>
);

const WatchRow = ({ name, brand, price, status, statusColor, img = "⌚" }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
        <div style={{ width: 48, height: 48, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, border: `1px solid ${C.borderSoft}` }}>{img}</div>
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>{name}</div>
            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>{brand}</div>
        </div>
        <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 15, color: C.goldLight, fontFamily: fonts.sans }}>{price}</div>
            <StatusPill label={status} color={statusColor} />
        </div>
    </div>
);

const InputField = ({ label, value, icon }) => (
    <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 5, fontFamily: fonts.sans, letterSpacing: 0.5 }}>{label}</div>
        <div style={{ background: C.bg, border: `1px solid ${C.borderSoft}`, borderRadius: 6, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            {icon && <span style={{ fontSize: 16, color: C.goldDark }}>{icon}</span>}
            <span style={{ fontSize: 15, color: C.text, fontFamily: fonts.sans }}>{value}</span>
        </div>
    </div>
);

// --- SLIDE DEFINITIONS ---
const slides = [
    // SLIDE 1 — CAPA
    () => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 340, height: 340, borderRadius: "50%", border: `1px solid ${C.border}`, opacity: 0.2 }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 260, height: 260, borderRadius: "50%", border: `1px solid ${C.border}`, opacity: 0.12 }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 440, height: 440, borderRadius: "50%", border: `1px solid ${C.borderSoft}`, opacity: 0.08 }} />
            <Badge>Blueprint Exclusivo</Badge>
            <div style={{ marginTop: 28 }}>
                <div style={{ fontSize: 19, letterSpacing: 6, color: C.goldDark, fontFamily: fonts.sans, textTransform: "uppercase", marginBottom: 12 }}>Sistema Inteligente de Gestão</div>
                <h1 style={{ fontSize: 48, fontFamily: fonts.serif, color: C.text, fontWeight: 400, lineHeight: 1.2, margin: 0 }}>Relógios de Luxo</h1>
                <GoldLine w={80} my={20} />
                <div style={{ fontSize: 38, fontFamily: fonts.serif, fontStyle: "italic", color: C.goldLight, marginTop: 4 }}>CHRONOS</div>
            </div>
            <div style={{ marginTop: 40, maxWidth: 420 }}>
                <div style={{ fontSize: 15, color: C.textMuted, letterSpacing: 1, fontFamily: fonts.sans, lineHeight: 1.8 }}>
                    Projeto exclusivo desenvolvido para
                </div>
                <div style={{ fontSize: 22, color: C.gold, fontFamily: fonts.serif, marginTop: 4, letterSpacing: 0.5 }}>Marcelo Miranda Soares Neto</div>
            </div>
            <div style={{ position: "absolute", bottom: 24, fontSize: 13, color: C.textMuted, letterSpacing: 2, fontFamily: fonts.sans }}>2026</div>
        </div>
    ),

    // SLIDE 2 — CENÁRIO ATUAL
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Diagnóstico</Badge>
            <h2 style={{ fontSize: 35, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>Cenário Atual da Operação</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 24 }}>Como funciona hoje o fluxo de gestão e divulgação dos relógios de Marcelo Miranda Soares Neto.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, flex: 1, alignContent: "start" }}>
                {[
                    { icon: "📸", n: "01", title: "Fotografia", desc: "Cada relógio é fotografado manualmente com o celular ou câmera" },
                    { icon: "🤖", n: "02", title: "IA para Descrição", desc: "Inteligência artificial auxilia na criação das descrições dos produtos" },
                    { icon: "📊", n: "03", title: "Planilhas", desc: "Informações são registradas e organizadas em planilhas avulsas" },
                    { icon: "📱", n: "04", title: "WhatsApp", desc: "Divulgação manual: foto + descrição + preço enviados pelo WhatsApp" },
                ].map((item, i) => (
                    <Card key={i} style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 32 }}>{item.icon}</span>
                            <span style={{ fontSize: 43, fontFamily: fonts.serif, color: C.border, fontWeight: 400 }}>{item.n}</span>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: C.text, fontFamily: fonts.sans }}>{item.title}</div>
                        <div style={{ fontSize: 15, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.6 }}>{item.desc}</div>
                    </Card>
                ))}
            </div>
            <Card style={{ marginTop: 16, background: "rgba(231,76,60,0.05)", border: `1px solid rgba(231,76,60,0.15)`, padding: "14px 20px" }}>
                <div style={{ fontSize: 15, color: "#E8A0A0", fontFamily: fonts.sans, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>⚠️</span>
                    <span>O processo funciona, mas é <strong style={{ color: "#F5B0B0" }}>manual, descentralizado e pouco escalável</strong>. Cada etapa depende de ações manuais e ferramentas desconectadas.</span>
                </div>
            </Card>
        </div>
    ),

    // SLIDE 3 — OPORTUNIDADE
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Oportunidade</Badge>
            <h2 style={{ fontSize: 35, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>A Evolução para Marcelo Miranda</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 28 }}>Transformar um processo que já funciona em uma plataforma inteligente, elegante e sob medida para a sua operação.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, flex: 1, alignContent: "start" }}>
                {[
                    { icon: "🎯", title: "Centralização", desc: "Todas as informações dos relógios em um único lugar, acessível de qualquer dispositivo" },
                    { icon: "✨", title: "Padronização", desc: "Anúncios com visual consistente e profissional, dignos de uma operação premium" },
                    { icon: "⚡", title: "Velocidade", desc: "Do cadastro à publicação em minutos, não horas. Ganho real de tempo operacional" },
                    { icon: "📦", title: "Estoque Inteligente", desc: "Controle total do inventário com status, busca e organização visual" },
                    { icon: "🚀", title: "Automação", desc: "Divulgação automática no WhatsApp com materiais prontos e padronizados" },
                    { icon: "💎", title: "Experiência Premium", desc: "Uma plataforma que reflete a sofisticação do negócio de relógios de luxo" },
                ].map((item, i) => (
                    <Card key={i} glow={i === 5} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 18 }}>
                        <span style={{ fontSize: 30 }}>{item.icon}</span>
                        <div style={{ fontSize: 18, fontWeight: 600, color: C.gold, fontFamily: fonts.sans }}>{item.title}</div>
                        <div style={{ fontSize: 15, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.6 }}>{item.desc}</div>
                    </Card>
                ))}
            </div>
        </div>
    ),

    // SLIDE 4 — VISÃO GERAL DO FLUXO
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Visão Geral</Badge>
            <h2 style={{ fontSize: 35, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>Fluxo Completo da Solução</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 20 }}>Da entrada ao sistema até a venda final — cada etapa pensada para simplificar e sofisticar a operação.</p>
            <Card style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 4 }}>
                    {[
                        { icon: "🔐", label: "Login" },
                        { icon: "📸", label: "Upload da Imagem" },
                        { icon: "🤖", label: "IA Preenche Dados" },
                        { icon: "✏️", label: "Revisão Manual" },
                        { icon: "📦", label: "Registro no Estoque" },
                        { icon: "🎨", label: "Geração de Materiais" },
                        { icon: "📱", label: "Publicação WhatsApp" },
                        { icon: "✅", label: "Controle de Venda" },
                    ].map((step, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 80 }}>
                                <div style={{ width: 56, height: 56, borderRadius: "50%", background: i === 0 || i === 7 ? `${C.gold}20` : C.accent, border: `1px solid ${i === 0 || i === 7 ? C.gold : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 27 }}>{step.icon}</div>
                                <span style={{ fontSize: 12, color: C.textMuted, textAlign: "center", maxWidth: 90, lineHeight: 1.3, fontFamily: fonts.sans }}>{step.label}</span>
                            </div>
                            {i < 7 && <span style={{ color: C.goldDark, fontSize: 22, marginBottom: 18 }}>›</span>}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 28, display: "flex", justifyContent: "center", gap: 24 }}>
                    {[
                        { label: "Automação", desc: "IA + fluxos automáticos" },
                        { label: "Controle", desc: "Estoque centralizado" },
                        { label: "Divulgação", desc: "WhatsApp integrado" },
                    ].map((item, i) => (
                        <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 15, color: C.gold, fontWeight: 600, fontFamily: fonts.sans }}>{item.label}</div>
                            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>{item.desc}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    ),

    // SLIDE 5 — TELA DE LOGIN
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 01</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Acesso Privado</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>O sistema começa com um login seguro e elegante. Apenas usuários autorizados acessam a plataforma.</p>
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Acesso protegido por credenciais", "Interface limpa e profissional", "Pronto para múltiplos usuários"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}>
                            <span style={{ color: C.gold }}>✓</span> {t}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 30px" }}>
                        <div style={{ fontSize: 27, fontFamily: fonts.serif, fontStyle: "italic", color: C.goldLight, marginBottom: 4 }}>CHRONOS</div>
                        <div style={{ fontSize: 12, color: C.textMuted, letterSpacing: 2, marginBottom: 24, fontFamily: fonts.sans }}>GESTÃO DE RELÓGIOS</div>
                        <InputField label="E-MAIL" value="marcelo@chronos.com" icon="✉" />
                        <InputField label="SENHA" value="••••••••••" icon="🔒" />
                        <div style={{ width: "100%", padding: "12px 0", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, borderRadius: 6, textAlign: "center", fontSize: 15, color: C.bg, fontWeight: 700, fontFamily: fonts.sans, letterSpacing: 1, marginTop: 8, cursor: "pointer" }}>ENTRAR</div>
                    </div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 6 — UPLOAD DA IMAGEM
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 02</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Upload da Imagem</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>A etapa mais simples: tire a foto ou faça upload. A imagem é a base para todo o cadastro, organização e divulgação.</p>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="CHRONOS — NOVO RELÓGIO">
                    <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, color: C.text, fontWeight: 600, fontFamily: fonts.sans, marginBottom: 16 }}>Cadastrar Novo Relógio</div>
                        <div style={{ border: `2px dashed ${C.border}`, borderRadius: 10, padding: "30px 20px", background: C.accent, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                            <div style={{ fontSize: 36, opacity: 0.6 }}>📸</div>
                            <div style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans }}>Arraste a imagem ou clique para enviar</div>
                            <div style={{ fontSize: 12, color: C.goldDark, fontFamily: fonts.sans }}>PNG, JPG ou HEIC • Até 10MB</div>
                            <div style={{ padding: "10px 28px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.gold, fontFamily: fonts.sans, marginTop: 6, cursor: "pointer" }}>ESCOLHER ARQUIVO</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "center" }}>
                            <div style={{ padding: "8px 16px", background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 6, fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>📷 Câmera</div>
                            <div style={{ padding: "8px 16px", background: C.surface, border: `1px solid ${C.borderSoft}`, borderRadius: 6, fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>📁 Galeria</div>
                        </div>
                    </div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 7 — IA LEITURA
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 03</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Leitura Inteligente com IA</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Após o upload, a inteligência artificial analisa a imagem e sugere automaticamente as informações do relógio.</p>
                <p style={{ fontSize: 15, color: C.goldDark, fontFamily: fonts.sans, lineHeight: 1.6, marginTop: 10, fontStyle: "italic" }}>A IA acelera e padroniza — mas nunca substitui a validação humana.</p>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="CHRONOS — IA ANALYSIS">
                    <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ width: 100, height: 100, borderRadius: 8, background: C.accent, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, flexShrink: 0 }}>⌚</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                                <span style={{ fontSize: 19 }}>🤖</span>
                                <span style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, letterSpacing: 1 }}>IA SUGESTÕES</span>
                                <div style={{ marginLeft: "auto" }}>
                                    <StatusPill label="PROCESSANDO..." color={C.gold} />
                                </div>
                            </div>
                            {[
                                { field: "Marca", value: "Rolex", conf: "98%" },
                                { field: "Modelo", value: "Submariner Date", conf: "94%" },
                                { field: "Material", value: "Aço Oystersteel", conf: "91%" },
                                { field: "Cor do Mostrador", value: "Preto", conf: "96%" },
                                { field: "Descrição", value: "Relógio automático em aço...", conf: "88%" },
                            ].map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: `1px solid ${C.borderSoft}` }}>
                                    <span style={{ fontSize: 12, color: C.textMuted, width: 80, fontFamily: fonts.sans }}>{item.field}</span>
                                    <span style={{ fontSize: 14, color: C.text, flex: 1, fontFamily: fonts.sans }}>{item.value}</span>
                                    <span style={{ fontSize: 11, color: C.green, fontFamily: fonts.sans }}>{item.conf}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 8 — REVISÃO MANUAL
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 04</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Revisão e Complementação</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>O usuário revisa os dados sugeridos pela IA, edita o que for necessário e complementa antes de salvar.</p>
                <p style={{ fontSize: 15, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.6, marginTop: 10 }}>Controle total, precisão e segurança nas informações antes de qualquer publicação.</p>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="CHRONOS — EDITAR RELÓGIO">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        <InputField label="MARCA" value="Rolex" icon="⌚" />
                        <InputField label="MODELO" value="Submariner Date" />
                        <InputField label="REFERÊNCIA" value="126610LN" />
                        <InputField label="CONDIÇÃO" value="Excelente" />
                        <InputField label="ACESSÓRIOS" value="Caixa, documentos, tags" />
                        <InputField label="PREÇO" value="R$ 78.000,00" icon="💰" />
                    </div>
                    <InputField label="DESCRIÇÃO" value="Rolex Submariner Date em aço Oystersteel com mostrador preto..." />
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                        <StatusPill label="RASCUNHO" color={C.orange} />
                        <div style={{ marginLeft: "auto", padding: "8px 24px", background: `linear-gradient(135deg, ${C.gold}, ${C.goldDark})`, borderRadius: 6, fontSize: 14, color: C.bg, fontWeight: 700, fontFamily: fonts.sans, letterSpacing: 0.5 }}>SALVAR</div>
                    </div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 9 — REGISTRO NO ESTOQUE
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 05</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Registro no Estoque</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Após o cadastro, o relógio entra automaticamente no estoque com status organizado e rastreável.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                        { label: "Rascunho", color: C.textMuted },
                        { label: "Disponível", color: C.green },
                        { label: "Reservado", color: C.orange },
                        { label: "Vendido", color: C.red },
                    ].map((s, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                            <span style={{ fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}>{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="CHRONOS — ESTOQUE">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        {[
                            { name: "Submariner Date", brand: "Rolex", price: "R$ 78.000", status: "Disponível", color: C.green },
                            { name: "Royal Oak 41mm", brand: "Audemars Piguet", price: "R$ 185.000", status: "Reservado", color: C.orange },
                            { name: "Nautilus 5711", brand: "Patek Philippe", price: "R$ 420.000", status: "Disponível", color: C.green },
                            { name: "Speedmaster Pro", brand: "Omega", price: "R$ 42.000", status: "Vendido", color: C.red },
                        ].map((w, i) => (
                            <Card key={i} style={{ padding: 12 }}>
                                <div style={{ width: "100%", height: 50, borderRadius: 6, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 8, border: `1px solid ${C.borderSoft}` }}>⌚</div>
                                <div style={{ fontSize: 14, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>{w.name}</div>
                                <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>{w.brand}</div>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                                    <span style={{ fontSize: 14, color: C.goldLight, fontFamily: fonts.sans }}>{w.price}</span>
                                    <StatusPill label={w.status} color={w.color} />
                                </div>
                            </Card>
                        ))}
                    </div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 10 — ESTOQUE INTERNO
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 06</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Painel do Inventário</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Visão completa de todos os relógios cadastrados — com busca, filtros e controle rápido.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                    {["Busca por marca, modelo ou referência", "Filtro por status e faixa de preço", "Visualização por imagem em grid", "Controle rápido e intuitivo"].map((t, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}>
                            <span style={{ color: C.gold }}>✓</span> {t}
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="CHRONOS — INVENTÁRIO">
                    <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                        <div style={{ flex: 1, background: C.bg, border: `1px solid ${C.borderSoft}`, borderRadius: 6, padding: "9px 12px", fontSize: 14, color: C.textMuted, fontFamily: fonts.sans, display: "flex", alignItems: "center", gap: 6 }}>
                            <span>🔍</span> Buscar relógio...
                        </div>
                        <div style={{ padding: "9px 14px", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 12, color: C.gold, fontFamily: fonts.sans }}>Filtros</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                        {["Todos (12)", "Disponível (7)", "Reservado (3)", "Vendido (2)"].map((f, i) => (
                            <div key={i} style={{ padding: "5px 12px", background: i === 0 ? `${C.gold}18` : "transparent", border: `1px solid ${i === 0 ? C.gold : C.borderSoft}`, borderRadius: 4, fontSize: 12, color: i === 0 ? C.gold : C.textMuted, fontFamily: fonts.sans }}>{f}</div>
                        ))}
                    </div>
                    <WatchRow name="Submariner Date" brand="Rolex" price="R$ 78.000" status="Disponível" statusColor={C.green} />
                    <WatchRow name="Royal Oak 41mm" brand="Audemars Piguet" price="R$ 185.000" status="Reservado" statusColor={C.orange} />
                    <WatchRow name="Nautilus 5711" brand="Patek Philippe" price="R$ 420.000" status="Disponível" statusColor={C.green} />
                    <WatchRow name="Speedmaster Pro" brand="Omega" price="R$ 42.000" status="Vendido" statusColor={C.red} />
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 11 — URL PÚBLICA
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 07</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Vitrine Digital</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Uma URL pública e elegante que Marcelo pode compartilhar com clientes interessados — um catálogo online sempre atualizado.</p>
                <div style={{ marginTop: 14, padding: "12px 16px", background: C.accent, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 14, color: C.goldLight, fontFamily: "monospace" }}>chronos.app/marcelo-miranda</div>
            </div>
            <div style={{ flex: 1.2 }}>
                <MockupFrame title="VITRINE PÚBLICA">
                    <div style={{ textAlign: "center", marginBottom: 14 }}>
                        <div style={{ fontSize: 22, fontFamily: fonts.serif, fontStyle: "italic", color: C.goldLight }}>CHRONOS</div>
                        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans, letterSpacing: 1.5 }}>COLEÇÃO DE MARCELO MIRANDA</div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                        {[
                            { name: "Submariner", price: "R$ 78.000" },
                            { name: "Royal Oak", price: "R$ 185.000" },
                            { name: "Nautilus", price: "R$ 420.000" },
                        ].map((w, i) => (
                            <div key={i} style={{ background: C.bg, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.borderSoft}` }}>
                                <div style={{ height: 60, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>⌚</div>
                                <div style={{ padding: 8 }}>
                                    <div style={{ fontSize: 14, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>{w.name}</div>
                                    <div style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, marginTop: 2 }}>{w.price}</div>
                                    <div style={{ fontSize: 11, color: C.green, fontFamily: fonts.sans, marginTop: 4 }}>● Disponível</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: C.textMuted, fontFamily: fonts.sans }}>Catálogo atualizado em tempo real</div>
                </MockupFrame>
            </div>
        </div>
    ),

    // SLIDE 12 — MATERIAIS DE DIVULGAÇÃO
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Tela 08</Badge>
            <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>Geração de Materiais de Divulgação</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 20 }}>Após o cadastro, o sistema gera automaticamente materiais visuais para divulgação — sempre com a foto real como base.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flex: 1, alignContent: "start" }}>
                {/* Material 1 - Foto Original */}
                <Card style={{ padding: 16, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, letterSpacing: 1, marginBottom: 10 }}>FORMATO 01</div>
                    <div style={{ background: C.bg, borderRadius: 8, padding: 14, border: `1px solid ${C.borderSoft}`, flex: 1 }}>
                        <div style={{ height: 70, background: C.accent, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 10 }}>⌚</div>
                        <div style={{ fontSize: 14, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>Rolex Submariner Date</div>
                        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans, marginTop: 4, lineHeight: 1.5 }}>Aço Oystersteel, mostrador preto, calibre 3235. Condição excelente.</div>
                        <div style={{ fontSize: 15, color: C.gold, fontFamily: fonts.sans, marginTop: 6, fontWeight: 700 }}>R$ 78.000</div>
                    </div>
                    <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans, marginTop: 10, textAlign: "center" }}>Foto + Descrição</div>
                </Card>
                {/* Material 2 - Card Premium */}
                <Card glow style={{ padding: 16, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, letterSpacing: 1, marginBottom: 10 }}>FORMATO 02</div>
                    <div style={{ background: `linear-gradient(135deg, #0F0F18, #18182A)`, borderRadius: 8, padding: 16, border: `1px solid ${C.gold}30`, flex: 1, position: "relative" }}>
                        <div style={{ position: "absolute", top: 8, right: 8, fontSize: 11, color: C.goldDark, fontFamily: fonts.sans, letterSpacing: 1 }}>CHRONOS</div>
                        <div style={{ height: 70, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, marginBottom: 10 }}>⌚</div>
                        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                            <div style={{ fontSize: 15, color: C.goldLight, fontFamily: fonts.serif }}>Rolex Submariner Date</div>
                            <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans, marginTop: 2 }}>Ref. 126610LN • Aço • Excelente</div>
                            <div style={{ fontSize: 19, color: C.gold, fontFamily: fonts.sans, fontWeight: 700, marginTop: 6 }}>R$ 78.000</div>
                        </div>
                    </div>
                    <div style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, marginTop: 10, textAlign: "center", fontWeight: 600 }}>Card Premium ★</div>
                </Card>
                {/* Material 3 - Arte */}
                <Card style={{ padding: 16, display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: 14, color: C.gold, fontFamily: fonts.sans, letterSpacing: 1, marginBottom: 10 }}>FORMATO 03</div>
                    <div style={{ background: `linear-gradient(135deg, #1A0F0F, #1A1A2E)`, borderRadius: 8, padding: 16, border: `1px solid ${C.borderSoft}`, flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 11, letterSpacing: 3, color: C.goldDark, fontFamily: fonts.sans, marginBottom: 8 }}>★ DISPONÍVEL ★</div>
                        <div style={{ fontSize: 38, marginBottom: 6 }}>⌚</div>
                        <div style={{ fontSize: 19, fontFamily: fonts.serif, color: C.goldLight, fontWeight: 600 }}>SUBMARINER</div>
                        <div style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans }}>ROLEX</div>
                        <div style={{ fontSize: 22, color: C.gold, fontFamily: fonts.sans, fontWeight: 700, marginTop: 8 }}>R$ 78.000</div>
                        <div style={{ fontSize: 11, color: C.textMuted, fontFamily: fonts.sans, marginTop: 4 }}>📱 Consulte disponibilidade</div>
                    </div>
                    <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans, marginTop: 10, textAlign: "center" }}>Arte Visual</div>
                </Card>
            </div>
        </div>
    ),

    // SLIDE 13 — PUBLICAÇÃO WHATSAPP
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 300 }}>
                <Badge>Tela 09</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Publicação no WhatsApp</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Com um clique, o sistema publica automaticamente no WhatsApp com imagem, descrição e preço — organizado e profissional.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}><span style={{ color: C.green }}>✓</span> Envio automático ou semi-automático</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}><span style={{ color: C.green }}>✓</span> Escolha do formato de divulgação</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 15, color: C.textMuted, fontFamily: fonts.sans }}><span style={{ color: C.green }}>✓</span> Apresentação sempre padronizada</div>
                </div>
            </div>
            <div style={{ flex: 1.2 }}>
                <div style={{ background: "#0B1E13", border: `1px solid #1A3A24`, borderRadius: 14, padding: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #1A3A24" }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📱</div>
                        <div>
                            <div style={{ fontSize: 15, color: "#E8E8E8", fontWeight: 600, fontFamily: fonts.sans }}>Relógios Premium — Grupo</div>
                            <div style={{ fontSize: 12, color: "#6B8F6B", fontFamily: fonts.sans }}>48 participantes</div>
                        </div>
                    </div>
                    <div style={{ background: "#0F2A18", borderRadius: 10, padding: 12, maxWidth: "85%", marginLeft: "auto" }}>
                        <div style={{ height: 80, background: "#1A3A24", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 8 }}>⌚</div>
                        <div style={{ fontSize: 15, color: "#E8E8E8", fontFamily: fonts.sans, fontWeight: 600 }}>🔥 Rolex Submariner Date</div>
                        <div style={{ fontSize: 14, color: "#B0C8B0", fontFamily: fonts.sans, marginTop: 4, lineHeight: 1.5 }}>Ref. 126610LN • Aço Oystersteel{"\n"}Mostrador preto • Condição excelente{"\n"}Caixa + documentos + tags</div>
                        <div style={{ fontSize: 18, color: "#25D366", fontFamily: fonts.sans, fontWeight: 700, marginTop: 8 }}>💰 R$ 78.000</div>
                        <div style={{ fontSize: 12, color: "#6B8F6B", fontFamily: fonts.sans, marginTop: 6, textAlign: "right" }}>09:15 ✓✓</div>
                    </div>
                </div>
            </div>
        </div>
    ),

    // SLIDE 14 — BAIXA NO ESTOQUE
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Automação</Badge>
            <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>Baixa no Estoque e Atualização</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 24 }}>Quando um relógio é vendido, o status muda e o sistema atualiza o estoque automaticamente.</p>
            <div style={{ display: "flex", gap: 24, flex: 1, alignItems: "center", justifyContent: "center" }}>
                <Card style={{ flex: 1, padding: 20, maxWidth: 280 }}>
                    <div style={{ fontSize: 14, color: C.green, fontFamily: fonts.sans, letterSpacing: 1, marginBottom: 12 }}>● ANTES</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 60, height: 60, borderRadius: 8, background: C.accent, border: `1px solid ${C.borderSoft}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>⌚</div>
                        <div>
                            <div style={{ fontSize: 15, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>Submariner Date</div>
                            <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans }}>Rolex • R$ 78.000</div>
                            <StatusPill label="Disponível" color={C.green} />
                        </div>
                    </div>
                </Card>
                <div style={{ fontSize: 28, color: C.gold }}>→</div>
                <Card style={{ flex: 1, padding: 20, maxWidth: 280, border: `1px solid ${C.red}30` }}>
                    <div style={{ fontSize: 14, color: C.red, fontFamily: fonts.sans, letterSpacing: 1, marginBottom: 12 }}>● DEPOIS</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 60, height: 60, borderRadius: 8, background: "rgba(231,76,60,0.08)", border: `1px solid rgba(231,76,60,0.15)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: 0.6 }}>⌚</div>
                        <div>
                            <div style={{ fontSize: 15, color: C.text, fontWeight: 600, fontFamily: fonts.sans, opacity: 0.6 }}>Submariner Date</div>
                            <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans, opacity: 0.6 }}>Rolex • R$ 78.000</div>
                            <StatusPill label="Vendido" color={C.red} />
                        </div>
                    </div>
                </Card>
            </div>
            <Card style={{ marginTop: 16, padding: "12px 20px", background: "rgba(46,204,113,0.05)", border: `1px solid rgba(46,204,113,0.15)` }}>
                <div style={{ fontSize: 15, color: "#A8E6CF", fontFamily: fonts.sans, display: "flex", alignItems: "center", gap: 8 }}>
                    <span>✅</span> O estoque, a vitrine pública e os materiais são atualizados automaticamente após a mudança de status.
                </div>
            </Card>
        </div>
    ),

    // SLIDE 15 — ROTINA DIÁRIA
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 320 }}>
                <Badge>Automação Diária</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>Atualização Automática</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Todos os dias pela manhã, o sistema pode enviar automaticamente uma mensagem com o estoque atualizado.</p>
                <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                        { icon: "⏰", label: "Agendamento", desc: "Horário configurável para envio diário" },
                        { icon: "📋", label: "Estoque do dia", desc: "Lista atualizada dos relógios disponíveis" },
                        { icon: "🤝", label: "Relacionamento", desc: "Automação de relacionamento comercial" },
                    ].map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                            <span style={{ fontSize: 22 }}>{item.icon}</span>
                            <div>
                                <div style={{ fontSize: 15, color: C.gold, fontWeight: 600, fontFamily: fonts.sans }}>{item.label}</div>
                                <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans }}>{item.desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ background: "#0B1E13", border: `1px solid #1A3A24`, borderRadius: 14, padding: 16, boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: "1px solid #1A3A24" }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>📱</div>
                        <span style={{ fontSize: 14, color: "#E8E8E8", fontFamily: fonts.sans }}>Relógios Premium — Grupo</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#6B8F6B", fontFamily: fonts.sans }}>08:00</span>
                    </div>
                    <div style={{ background: "#0F2A18", borderRadius: 10, padding: 12, maxWidth: "90%", marginLeft: "auto" }}>
                        <div style={{ fontSize: 14, color: "#E8E8E8", fontFamily: fonts.sans, fontWeight: 600, marginBottom: 8 }}>☀️ Bom dia! Estoque atualizado:</div>
                        {["⌚ Rolex Submariner — R$ 78.000", "⌚ AP Royal Oak — R$ 185.000", "⌚ Patek Nautilus — R$ 420.000", "⌚ Cartier Santos — R$ 55.000"].map((item, i) => (
                            <div key={i} style={{ fontSize: 12, color: "#B0C8B0", fontFamily: fonts.sans, padding: "4px 0", borderBottom: i < 3 ? "1px solid #1A3A24" : "none" }}>{item}</div>
                        ))}
                        <div style={{ fontSize: 12, color: "#25D366", fontFamily: fonts.sans, marginTop: 8, fontWeight: 600 }}>💬 Interesse em algum? Chama no privado!</div>
                        <div style={{ fontSize: 11, color: "#6B8F6B", fontFamily: fonts.sans, marginTop: 4, textAlign: "right" }}>08:00 ✓✓</div>
                    </div>
                </div>
            </div>
        </div>
    ),

    // SLIDE 16 — BENEFÍCIOS
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", flexDirection: "column" }}>
            <Badge>Benefícios</Badge>
            <h2 style={{ fontSize: 35, fontFamily: fonts.serif, color: C.text, margin: "16px 0 6px", fontWeight: 400 }}>O que muda na operação</h2>
            <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 600, lineHeight: 1.7, marginBottom: 24 }}>Uma visão clara dos ganhos reais que o sistema trará para o dia a dia de Marcelo Miranda Soares Neto.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, flex: 1, alignContent: "start" }}>
                {[
                    { icon: "⚡", title: "Menos Operação Manual", desc: "Cadastro, estoque e divulgação em um único fluxo automatizado" },
                    { icon: "🎯", title: "Mais Organização", desc: "Tudo centralizado: fotos, dados, preços, status e histórico" },
                    { icon: "🚀", title: "Mais Velocidade", desc: "Do upload à publicação em minutos, não horas" },
                    { icon: "✨", title: "Padrão Visual Premium", desc: "Materiais de divulgação consistentes e sofisticados" },
                    { icon: "📦", title: "Estoque Centralizado", desc: "Controle total com busca, filtros e status em tempo real" },
                    { icon: "📱", title: "Divulgação Inteligente", desc: "WhatsApp integrado com envio automático e formatação profissional" },
                ].map((item, i) => (
                    <Card key={i} style={{ display: "flex", gap: 14, padding: 16, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 30, flexShrink: 0 }}>{item.icon}</span>
                        <div>
                            <div style={{ fontSize: 18, color: C.gold, fontWeight: 600, fontFamily: fonts.sans }}>{item.title}</div>
                            <div style={{ fontSize: 15, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.5, marginTop: 4 }}>{item.desc}</div>
                        </div>
                    </Card>
                ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 15, color: C.goldDark, fontFamily: fonts.serif, fontStyle: "italic" }}>Base pronta para crescimento futuro e novos canais de venda.</div>
        </div>
    ),

    // SLIDE 17 — VALIDAÇÃO PRE-MVP
    () => (
        <div style={{ padding: "40px 48px", height: "100%", display: "flex", gap: 40, alignItems: "center" }}>
            <div style={{ flex: 1, maxWidth: 340 }}>
                <Badge>Validação</Badge>
                <h2 style={{ fontSize: 32, fontFamily: fonts.serif, color: C.text, margin: "16px 0 8px", fontWeight: 400 }}>O que será validado antes do MVP</h2>
                <GoldLine w={50} my={12} />
                <p style={{ fontSize: 16, color: C.textMuted, fontFamily: fonts.sans, lineHeight: 1.7 }}>Este blueprint serve para alinhar a visão do produto antes de iniciar o desenvolvimento. Nada será construído sem aprovação prévia.</p>
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                        { n: "01", title: "Fluxo Ideal", desc: "Validar a jornada completa do cadastro à venda" },
                        { n: "02", title: "Telas Principais", desc: "Aprovar o layout e a experiência visual do sistema" },
                        { n: "03", title: "Automações Desejadas", desc: "Confirmar quais automações são prioridade" },
                        { n: "04", title: "Jornada do Usuário", desc: "Garantir que o sistema faz sentido para quem usa" },
                        { n: "05", title: "Prioridade das Funcionalidades", desc: "Definir o que entra no MVP e o que fica para fases futuras" },
                    ].map((item, i) => (
                        <Card key={i} style={{ display: "flex", gap: 14, padding: 14, alignItems: "center" }}>
                            <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${C.gold}15`, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: C.gold, fontWeight: 700, fontFamily: fonts.sans, flexShrink: 0 }}>{item.n}</div>
                            <div>
                                <div style={{ fontSize: 16, color: C.text, fontWeight: 600, fontFamily: fonts.sans }}>{item.title}</div>
                                <div style={{ fontSize: 14, color: C.textMuted, fontFamily: fonts.sans, marginTop: 2 }}>{item.desc}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    ),

    // SLIDE 18 — ENCERRAMENTO
    () => (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", textAlign: "center", position: "relative" }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", border: `1px solid ${C.border}`, opacity: 0.12 }} />
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, borderRadius: "50%", border: `1px solid ${C.borderSoft}`, opacity: 0.06 }} />
            <Badge>Próximo Passo</Badge>
            <h2 style={{ fontSize: 40, fontFamily: fonts.serif, color: C.text, margin: "24px 0 8px", fontWeight: 400, lineHeight: 1.3 }}>Validar, Aprovar e Construir</h2>
            <GoldLine w={80} my={16} />
            <p style={{ fontSize: 18, color: C.textMuted, fontFamily: fonts.sans, maxWidth: 520, lineHeight: 1.8 }}>
                Após validar este blueprint, o próximo passo será estruturar um MVP enxuto, funcional e estratégico, com foco nas funcionalidades essenciais para a operação real.
            </p>
            <div style={{ marginTop: 32, fontSize: 22, fontFamily: fonts.serif, color: C.goldLight, fontStyle: "italic" }}>Marcelo Miranda Soares Neto</div>
            <div style={{ fontSize: 14, color: C.goldDark, fontFamily: fonts.sans, marginTop: 6, letterSpacing: 2 }}>PROJETO EXCLUSIVO</div>
            <div style={{ position: "absolute", bottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ fontSize: 13, color: C.textMuted, letterSpacing: 2, fontFamily: fonts.sans }}>2026</div>
            </div>
        </div>
    ),
];

// --- MAIN COMPONENT ---
export default function Presentation() {
    const [current, setCurrent] = useState(0);
    const [transitioning, setTransitioning] = useState(false);

    const go = useCallback((dir) => {
        if (transitioning) return;
        const next = current + dir;
        if (next < 0 || next >= slides.length) return;
        setTransitioning(true);
        setTimeout(() => { setCurrent(next); setTransitioning(false); }, 200);
    }, [current, transitioning]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); go(1); }
            if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [go]);

    const SlideContent = slides[current];

    return (
        <div style={{ width: "100%", minHeight: "100vh", background: C.bg, fontFamily: fonts.sans, color: C.text, display: "flex", flexDirection: "column", userSelect: "none" }}>
            <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .slide-container { animation: fadeIn 0.35s ease-out; }
        .nav-btn { transition: all 0.2s; }
        .nav-btn:hover { background: rgba(201,168,76,0.12) !important; }
        .dot { transition: all 0.2s; cursor: pointer; }
        .dot:hover { background: rgba(201,168,76,0.5) !important; }
        * { box-sizing: border-box; }
        ::selection { background: rgba(201,168,76,0.3); }
      `}</style>

            {/* Slide Area */}
            <div style={{ flex: 1, display: "flex", position: "relative", minHeight: 0 }}>
                {/* Left nav */}
                <button className="nav-btn" onClick={() => go(-1)} disabled={current === 0}
                    style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", background: "rgba(201,168,76,0.06)", border: `1px solid ${C.borderSoft}`, color: current === 0 ? C.textMuted + "40" : C.gold, fontSize: 22, cursor: current === 0 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>

                {/* Slide */}
                <div className="slide-container" key={current} style={{ flex: 1, opacity: transitioning ? 0 : 1, transition: "opacity 0.2s", overflow: "auto" }}>
                    <SlideContent />
                </div>

                {/* Right nav */}
                <button className="nav-btn" onClick={() => go(1)} disabled={current === slides.length - 1}
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", zIndex: 10, width: 48, height: 48, borderRadius: "50%", background: "rgba(201,168,76,0.06)", border: `1px solid ${C.borderSoft}`, color: current === slides.length - 1 ? C.textMuted + "40" : C.gold, fontSize: 22, cursor: current === slides.length - 1 ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
            </div>

            {/* Bottom bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 16px", gap: 16, borderTop: `1px solid ${C.borderSoft}` }}>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans, letterSpacing: 1, minWidth: 50 }}>{String(current + 1).padStart(2, "0")} / {slides.length}</span>
                <div style={{ display: "flex", gap: 4 }}>
                    {slides.map((_, i) => (
                        <div key={i} className="dot" onClick={() => { if (!transitioning) { setTransitioning(true); setTimeout(() => { setCurrent(i); setTransitioning(false); }, 200); } }}
                            style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? C.gold : `${C.gold}30`, transition: "all 0.3s" }} />
                    ))}
                </div>
                <span style={{ fontSize: 12, color: C.textMuted, fontFamily: fonts.sans, letterSpacing: 1.5, minWidth: 50, textAlign: "right" }}></span>
            </div>
        </div>
    );
}