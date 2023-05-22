import styled from "styled-components";
import { useEffect, useState } from "react";
import tombstone from "../assets/tombstone.png";

const Reservation = ({ reservationId }) => {
  const [reserve, setReserve] = useState("");

  useEffect(() => {
    if (reservationId) {
      fetch(`/api/get-reservation/${reservationId}`)
        .then((res) => res.json())
        .then((resData) => {
          setReserve(resData);
          console.log("resData Confirmation", resData);
        })
        .catch((err) => {
          console.log("Header error", err);
        });
    }
  }, [reservationId]);

  if (!reserve) {
    return <div>Loading..</div>;
  }
  return (
    <Wrapper>
      <ConfirmationWrapper>
        <Flight>Your reservation!</Flight>
        <Line></Line>
        <InfoDetails>
          <div>
            <Details>Reservation #: </Details>
            {reserve.seats._id}
          </div>
          <div>
            <Details>Flight #: </Details>
            {reserve.seats.flight}
          </div>
          <div>
            <Details>seat #: </Details>
            {reserve.seats.seat}
          </div>
          <div>
            <Details>Name: </Details>
            {reserve.seats.givenName} {reserve.seats.surname}
          </div>
          <div>
            <Details>Email: </Details>
            {reserve.seats.email}
          </div>
        </InfoDetails>
      </ConfirmationWrapper>
      <Tombstone src={tombstone} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const ConfirmationWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 250px;
  width: 500px;
  place-items: center;
  border: 1px solid black;
`;

const Flight = styled.p`
  color: var(--color-alabama-crimson);
  font-weight: bold;
  font-size: 20px;
  padding: 10px;
  text-align: left;
  width: 450px;
`;

const Line = styled.div`
  width: 450px;
  border: 1px solid black;
  margin-bottom: 10px;
`;

const InfoDetails = styled.div`
  width: 450px;
  height: 150px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Details = styled.span`
  font-weight: bold;
  gap: 20px;
  padding-top: 20px;
`;

const Tombstone = styled.img`
  width: 200px;
  height: 200px;
  margin: 50px;
`;

// STRETCH: add FE components to fetch/update/delete reservations
export default Reservation;
