import React, { type ReactNode } from 'react';
import Paginator from '@theme-original/DocItem/Paginator';
import type PaginatorType from '@theme/DocItem/Paginator';
import type { WrapperProps } from '@docusaurus/types';
import Giscus from '@giscus/react';
import { useColorMode } from '@docusaurus/theme-common';

type Props = WrapperProps<typeof PaginatorType>;

export default function PaginatorWrapper(props: Props): ReactNode {
    const { colorMode } = useColorMode();

    return (
        <>
            <Paginator {...props} />

            <Giscus
                repo="tango-adb/docs"
                repoId="R_kgDOIvSJsA"
                category="Comments"
                categoryId="DIC_kwDOIvSJsM4Cp6Ot"
                mapping="pathname"
                strict="0"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme={colorMode}
                lang="en"
                loading="lazy"
            />
        </>
    );
}
