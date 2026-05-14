declare const _default: {
    content: string[];
    theme: {
        extend: {
            colors: {
                ops: {
                    canvas: string;
                    panel: string;
                    elevated: string;
                    border: string;
                    foreground: string;
                    muted: string;
                };
                sev: {
                    critical: string;
                    high: string;
                    medium: string;
                    low: string;
                };
                state: {
                    open: string;
                    investigating: string;
                    monitoring: string;
                    resolved: string;
                    closed: string;
                    new: string;
                    acknowledged: string;
                };
                incident: {
                    glow: string;
                };
            };
            boxShadow: {
                card: string;
                'card-hover': string;
                shell: string;
            };
            fontFamily: {
                sans: [string, string, string];
            };
            fontSize: {
                '2xs': [string, {
                    lineHeight: string;
                }];
            };
            spacing: {
                18: string;
            };
        };
    };
    plugins: any[];
};
export default _default;
