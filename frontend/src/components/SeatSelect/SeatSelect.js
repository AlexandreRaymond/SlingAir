import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Plane from "./Plane";
import Form from "./Form";

const SeatSelect = ({ selectedFlight, setReservationId }) => {
  const [selectedSeat, setSelectedSeat] = useState("");
  const [reserve, setReserve] = useState("");

  const navigate = useNavigate();
  const handleSubmit = (e, formData) => {
    e.preventDefault();

    fetch("/api/add-reservation", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        flight: selectedFlight,
        seat: selectedSeat,
        givenName: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
      }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setReserve(resData);

        setReservationId(resData.data.reservationId);
        window.localStorage.setItem(
          "ReservationId",
          resData.data.reservationId
        );
        console.log("Reservation granted!", resData.data.reservationId);
      });

    navigate("/confirmation");
  };

  return (
    <Wrapper>
      <h2>Select your seat and Provide your information!</h2>
      <>
        <FormWrapper>
          <Plane
            setSelectedSeat={setSelectedSeat}
            selectedFlight={selectedFlight}
          />
          <Form handleSubmit={handleSubmit} selectedSeat={selectedSeat} />
        </FormWrapper>
      </>
    </Wrapper>
  );
};

const FormWrapper = styled.div`
  display: flex;
  margin: 50px 0px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
`;

export default SeatSelect;
