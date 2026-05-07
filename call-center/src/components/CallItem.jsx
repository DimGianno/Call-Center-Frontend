function CallItem({ call }) {
  const formattedDate = new Date(call.created_at).toLocaleString()

    return (
      <div>
        <p>direction: {call.direction}</p>
        <p>from: {call.from}</p>
        <p>to: {call.to}</p>
        <p>call_type: {call.call_type}</p>
        <p>duration: {call.duration} seconds</p>
        <p>is_archived: {call.is_archived.toString()}</p>
        <p>created_at: {call.formattedDate}</p>
        <p>notes: {call.notes?.length > 0 ? call.notes[0].content : 'No notes'}</p>
      </div>
  );
}

export default CallItem;
