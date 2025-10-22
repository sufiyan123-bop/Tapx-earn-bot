import dynamic from "next/dynamic";

const UserApp = dynamic(() => import("./(user)/page"), { ssr: false });

export default function Home() {
  return <UserApp />;
}
