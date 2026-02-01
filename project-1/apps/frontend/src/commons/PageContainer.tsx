import type { ReactNode } from "react";

type PageContainerProps = {
	children: ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
	return (
		<div className="app-shell text-base-content" data-theme="winter">
			<div className="app-frame mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
				{children}
			</div>
		</div>
	);
}
