export default function Stage8({ data, settings }) {
  const enSize = settings?.enSize ?? 11.5
  const koSize = settings?.koSize ?? 10

  if (!data || data.error) return null

  const passage = data.passage || ''

  return (
    <div>
      {passage ? (
        <div style={{
          fontFamily:'Georgia, serif', fontSize:enSize, lineHeight:2.2,
          padding:'12px 16px',
          border:'1px solid #ddd', borderRadius:4,
          background:'#fafafa'
        }}
          dangerouslySetInnerHTML={{__html: passage}}
        />
      ) : (
        <div style={{fontSize:koSize, color:'#aaa'}}>
          * 지문이 아직 로드되지 않았거나, AI가 passage 필드를 생성하지 않았습니다.
        </div>
      )}
    </div>
  )
}
