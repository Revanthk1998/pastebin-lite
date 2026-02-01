import { GetServerSideProps } from "next";

type Props = {
  content: string;
};

export default function PastePage({ content }: Props) {
  return (
    <main
      style={{
        padding: "2rem",
        whiteSpace: "pre-wrap",
        fontFamily: "monospace",
      }}
    >
      {content}
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params as { id: string };

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/pastes/${id}`);

  if (!res.ok) {
    return { notFound: true };
  }

  const data = await res.json();

  return {
    props: {
      content: data.content,
    },
  };
};
