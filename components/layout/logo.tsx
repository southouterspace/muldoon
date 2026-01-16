import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: number;
  showText?: boolean;
}

export function Logo({
  size = 40,
  showText = true,
}: LogoProps): React.ReactElement {
  return (
    <Link className="flex items-center gap-2" href="/">
      <Image
        alt="Raptors Logo"
        className="drop-shadow-md"
        height={size}
        priority
        src="/raptor-logo.png"
        width={size}
      />
      {showText && <span className="font-bold text-xl">Raptors</span>}
    </Link>
  );
}
