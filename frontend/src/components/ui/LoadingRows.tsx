export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={index}>
          <td colSpan={8}>
            <div className="skeleton-row" />
          </td>
        </tr>
      ))}
    </>
  );
}
