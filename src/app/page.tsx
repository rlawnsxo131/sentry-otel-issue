import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles["container"]}>
      <h1>home</h1>
      <Link className={styles["link"]} href="/r1">
        /r1
      </Link>
      <Link className={styles["link"]} href="/r2">
        /r2
      </Link>
      <Link className={styles["link"]} href="/r3/john">
        /r3/john
      </Link>
    </div>
  );
}
