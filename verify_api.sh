#!/bin/bash

BASE_URL="http://localhost:3001/api"

echo "1. Listing turnos (should be empty or have previous ones)..."
curl -s "$BASE_URL/turnos" | python3 -m json.tool

echo -e "\n\n2. Creating a new turno..."
CREATE_RES=$(curl -s -X POST "$BASE_URL/turnos" \
  -H "Content-Type: application/json" \
  -d '{"fecha": "2025-12-01", "horaInicio": "10:00", "horaFin": "11:00", "cupoMaximo": 5}')
echo $CREATE_RES | python3 -m json.tool

TURNO_ID=$(echo $CREATE_RES | python3 -c "import sys, json; print(json.load(sys.stdin)['id'])")
echo "Created Turno ID: $TURNO_ID"

echo -e "\n\n3. Listing turnos again..."
curl -s "$BASE_URL/turnos?fecha=2025-12-01" | python3 -m json.tool

echo -e "\n\n4. Inscribing a person..."
curl -s -X POST "$BASE_URL/turnos/$TURNO_ID/inscribir" \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Test User", "dni": "12345678", "email": "test@mail.com"}' | python3 -m json.tool

echo -e "\n\n5. Checking turno details (cupo should be 4)..."
curl -s "$BASE_URL/turnos/$TURNO_ID" | python3 -m json.tool
