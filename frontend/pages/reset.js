import RequestReset from '../components/RequestReset';
import Reset from '../components/Reset';

const ResetPage = ({ query }) => {
  console.log(query);

  if (!query?.token) {
    return (
      <div>
        <p>Sorry you must supply the token</p>
        <RequestReset />
      </div>
    );
  }

  return (
    <div>
      <Reset token={query.token} />
    </div>
  );
};

export default ResetPage;
