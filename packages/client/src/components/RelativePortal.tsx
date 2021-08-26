import { Portal, PortalProps } from "@chakra-ui/react";
import { WithChildren } from "@pastable/core";
import { useMemo, useState } from "react";
import { usePopper } from "react-popper";

export function RelativePortal({ children, referenceElement, options, ...portalProps }: RelativePortalProps) {
    // https://github.com/popperjs/popper-core/issues/794
    const popperModifiers = useMemo(
        () => [
            {
                name: "sameWidth",
                enabled: true,
                phase: "beforeWrite",
                requires: ["computeStyles"],
                fn({ state }: any) {
                    state.styles.popper.width = `${state.rects.reference.width}px`;
                },
                effect({ state }: any) {
                    state.elements.popper.style.width = `${state.elements.reference.offsetWidth}px`;
                },
            },
        ],
        []
    );

    const [popperElement, setPopperElement] = useState(null);
    const config = { ...options, modifiers: (options?.modifiers || []).concat(popperModifiers as any) };
    const popper = usePopper(referenceElement, popperElement, config);

    return (
        <Portal {...portalProps}>
            <div ref={setPopperElement} style={{ ...popper.styles.popper, zIndex: 10 }} {...popper.attributes.popper}>
                {children}
            </div>
        </Portal>
    );
}

type UsePopperArgs = Parameters<typeof usePopper>;

export interface RelativePortalProps extends WithChildren, PortalProps {
    referenceElement: UsePopperArgs["0"];
    options?: UsePopperArgs["2"];
}
