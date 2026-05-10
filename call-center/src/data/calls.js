const calls = [
  {
      id: "1",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 12 34 56 78",
      call_type: "answered",
      duration: 326,
      is_archived: false,
      created_at: "2025-04-30T15:30:00Z"
    },
  {
      id: "2",
      direction: "inbound",
      from: "+33 6 98 76 54 32",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 803,
      is_archived: false,
      created_at: "2025-04-30T10:40:00Z"
    },
  {
      id: "3",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 55 44 33 22",
      call_type: "answered",
      duration: 140,
      is_archived: false,
      created_at: "2025-04-30T15:30:00Z"
    },
  {
      id: "4",
      direction: "inbound",
      from: "+33 6 11 22 33 44",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 248,
      is_archived: false,
      created_at: "2025-04-29T10:15:00Z",
      notes: [
        {
                id: "note-1",
                content: "Customer asked for a follow-up email."
              }
      ]
    },
  {
      id: "5",
      direction: "inbound",
      from: "+33 6 44 55 66 77",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-29T18:35:00Z"
    },
  {
      id: "6",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 22 33 44 55",
      call_type: "answered",
      duration: 204,
      is_archived: false,
      created_at: "2025-04-29T15:20:00Z"
    },
  {
      id: "7",
      direction: "inbound",
      from: "+33 6 99 88 77 66",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 412,
      is_archived: true,
      created_at: "2025-04-28T13:00:00Z"
    },
  {
      id: "8",
      direction: "inbound",
      from: "+33 6 33 22 11 00",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 515,
      is_archived: false,
      created_at: "2025-04-28T10:40:00Z",
      notes: [
        {
                id: "note-2",
                content: "Customer requested information about pricing plans."
              }
      ]
    },
  {
      id: "9",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 10 20 30 40",
      call_type: "answered",
      duration: 610,
      is_archived: false,
      created_at: "2025-04-28T13:55:00Z"
    },
  {
      id: "10",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 70 80 90 10",
      call_type: "voicemail",
      duration: 98,
      is_archived: false,
      created_at: "2025-04-27T14:50:00Z",
      notes: [
        {
                id: "note-3",
                content: "Customer left a message about their invoice."
              }
      ]
    },
  {
      id: "11",
      direction: "inbound",
      from: "+33 6 45 67 89 01",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-27T14:40:00Z",
      notes: [
        {
                id: "note-4",
                content: "Needs a call back next week."
              }
      ]
    },
  {
      id: "12",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 88 77 66 55",
      call_type: "voicemail",
      duration: 73,
      is_archived: false,
      created_at: "2025-04-27T14:10:00Z",
      notes: [
        {
                id: "note-5",
                content: "Agent left a voicemail about contract renewal."
              }
      ]
    },
  {
      id: "13",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 18 28 38 48",
      call_type: "answered",
      duration: 424,
      is_archived: true,
      created_at: "2025-04-26T13:30:00Z"
    },
  {
      id: "14",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 25 35 45 55",
      call_type: "missed",
      duration: 0,
      is_archived: true,
      created_at: "2025-04-26T17:00:00Z"
    },
  {
      id: "15",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 91 82 73 64",
      call_type: "answered",
      duration: 295,
      is_archived: false,
      created_at: "2025-04-26T16:10:00Z"
    },
  {
      id: "16",
      direction: "inbound",
      from: "+33 6 58 47 36 25",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 106,
      is_archived: false,
      created_at: "2025-04-25T10:30:00Z",
      notes: [
        {
                id: "note-6",
                content: "Customer asked about account cancellation."
              }
      ]
    },
  {
      id: "17",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 66 77 88 99",
      call_type: "voicemail",
      duration: 32,
      is_archived: false,
      created_at: "2025-04-25T15:45:00Z",
      notes: [
        {
                id: "note-7",
                content: "Customer wanted confirmation about delivery time."
              },
        {
                id: "note-8",
                content: "Customer left a message about a billing problem."
              }
      ]
    },
  {
      id: "18",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 22 44 66 88",
      call_type: "answered",
      duration: 112,
      is_archived: false,
      created_at: "2025-04-25T15:00:00Z"
    },
  {
      id: "19",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 13 57 91 24",
      call_type: "answered",
      duration: 716,
      is_archived: false,
      created_at: "2025-04-24T11:15:00Z"
    },
  {
      id: "20",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 30 31 32 33",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-24T16:25:00Z"
    },
  {
      id: "21",
      direction: "inbound",
      from: "+33 7 40 50 60 70",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: true,
      created_at: "2025-04-24T10:25:00Z"
    },
  {
      id: "22",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 77 12 45 90",
      call_type: "answered",
      duration: 642,
      is_archived: false,
      created_at: "2025-04-23T12:20:00Z"
    },
  {
      id: "23",
      direction: "inbound",
      from: "+33 6 19 29 39 49",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 90,
      is_archived: false,
      created_at: "2025-04-23T11:40:00Z",
      notes: [
        {
                id: "note-9",
                content: "Agent explained the new subscription options."
              }
      ]
    },
  {
      id: "24",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 01 02 03 04",
      call_type: "voicemail",
      duration: 44,
      is_archived: false,
      created_at: "2025-04-23T15:55:00Z",
      notes: [
        {
                id: "note-10",
                content: "Customer asked for a refund status update."
              }
      ]
    },
  {
      id: "25",
      direction: "inbound",
      from: "+33 6 81 82 83 84",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 435,
      is_archived: false,
      created_at: "2025-04-22T09:10:00Z"
    },
  {
      id: "26",
      direction: "inbound",
      from: "+33 6 90 80 70 60",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 26,
      is_archived: true,
      created_at: "2025-04-22T16:55:00Z",
      notes: [
        {
                id: "note-11",
                content: "Customer confirmed appointment details."
              }
      ]
    },
  {
      id: "27",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 33 44 55 66",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-22T13:40:00Z"
    },
  {
      id: "28",
      direction: "inbound",
      from: "+33 6 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 48,
      is_archived: true,
      created_at: "2025-04-21T14:05:00Z",
      notes: [
        {
                id: "note-12",
                content: "Customer asked to update their contact information."
              }
      ]
    },
  {
      id: "29",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 14 25 36 47",
      call_type: "answered",
      duration: 153,
      is_archived: false,
      created_at: "2025-04-21T13:55:00Z"
    },
  {
      id: "30",
      direction: "inbound",
      from: "+33 7 12 24 36 48",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 427,
      is_archived: false,
      created_at: "2025-04-21T16:05:00Z"
    },
  {
      id: "31",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 21 43 65 87",
      call_type: "voicemail",
      duration: 25,
      is_archived: false,
      created_at: "2025-04-20T09:20:00Z",
      notes: [
        {
                id: "note-13",
                content: "Agent left voicemail about pending verification."
              }
      ]
    },
  {
      id: "32",
      direction: "inbound",
      from: "+33 7 65 43 21 09",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 416,
      is_archived: false,
      created_at: "2025-04-20T14:30:00Z",
      notes: [
        {
                id: "note-14",
                content: "Customer issue escalated to technical support."
              }
      ]
    },
  {
      id: "33",
      direction: "inbound",
      from: "+33 6 80 70 60 50",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 35,
      is_archived: false,
      created_at: "2025-04-20T16:50:00Z",
      notes: [
        {
                id: "note-15",
                content: "Ticket number was shared with the customer."
              }
      ]
    },
  {
      id: "34",
      direction: "inbound",
      from: "+33 7 15 26 37 48",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 823,
      is_archived: false,
      created_at: "2025-04-19T10:35:00Z"
    },
  {
      id: "35",
      direction: "inbound",
      from: "+33 6 91 82 73 64",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 607,
      is_archived: true,
      created_at: "2025-04-19T16:25:00Z"
    },
  {
      id: "36",
      direction: "inbound",
      from: "+33 7 09 18 27 36",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-19T15:05:00Z"
    },
  {
      id: "37",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 12 34 56 78",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-18T14:15:00Z"
    },
  {
      id: "38",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 98 76 54 32",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-18T11:05:00Z"
    },
  {
      id: "39",
      direction: "inbound",
      from: "+33 7 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 110,
      is_archived: true,
      created_at: "2025-04-18T13:45:00Z"
    },
  {
      id: "40",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 11 22 33 44",
      call_type: "answered",
      duration: 270,
      is_archived: false,
      created_at: "2025-04-17T18:40:00Z",
      notes: [
        {
                id: "note-16",
                content: "Customer requested a copy of the contract."
              }
      ]
    },
  {
      id: "41",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 44 55 66 77",
      call_type: "answered",
      duration: 114,
      is_archived: false,
      created_at: "2025-04-17T18:20:00Z"
    },
  {
      id: "42",
      direction: "inbound",
      from: "+33 6 22 33 44 55",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 730,
      is_archived: true,
      created_at: "2025-04-17T11:30:00Z"
    },
  {
      id: "43",
      direction: "inbound",
      from: "+33 6 99 88 77 66",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-16T09:00:00Z"
    },
  {
      id: "44",
      direction: "inbound",
      from: "+33 6 33 22 11 00",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-16T12:30:00Z",
      notes: [
        {
                id: "note-17",
                content: "Customer asked about payment methods."
              }
      ]
    },
  {
      id: "45",
      direction: "inbound",
      from: "+33 7 10 20 30 40",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-16T13:15:00Z"
    },
  {
      id: "46",
      direction: "inbound",
      from: "+33 6 70 80 90 10",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 31,
      is_archived: false,
      created_at: "2025-04-15T17:45:00Z",
      notes: [
        {
                id: "note-18",
                content: "Customer reported a login issue."
              }
      ]
    },
  {
      id: "47",
      direction: "inbound",
      from: "+33 6 45 67 89 01",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 156,
      is_archived: false,
      created_at: "2025-04-15T15:30:00Z"
    },
  {
      id: "48",
      direction: "inbound",
      from: "+33 7 88 77 66 55",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 477,
      is_archived: false,
      created_at: "2025-04-15T16:25:00Z",
      notes: [
        {
                id: "note-19",
                content: "Agent scheduled a follow-up call."
              }
      ]
    },
  {
      id: "49",
      direction: "inbound",
      from: "+33 6 18 28 38 48",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 34,
      is_archived: true,
      created_at: "2025-04-14T11:05:00Z",
      notes: [
        {
                id: "note-20",
                content: "Customer asked about changing their plan."
              }
      ]
    },
  {
      id: "50",
      direction: "inbound",
      from: "+33 6 25 35 45 55",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-14T10:45:00Z"
    },
  {
      id: "51",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 91 82 73 64",
      call_type: "voicemail",
      duration: 55,
      is_archived: false,
      created_at: "2025-04-14T16:15:00Z",
      notes: [
        {
                id: "note-21",
                content: "Customer asked for a follow-up email."
              },
        {
                id: "note-22",
                content: "Customer requested information about pricing plans."
              }
      ]
    },
  {
      id: "52",
      direction: "inbound",
      from: "+33 6 58 47 36 25",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 455,
      is_archived: true,
      created_at: "2025-04-13T18:35:00Z",
      notes: [
        {
                id: "note-23",
                content: "Customer left a message about their invoice."
              }
      ]
    },
  {
      id: "53",
      direction: "inbound",
      from: "+33 6 66 77 88 99",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 58,
      is_archived: false,
      created_at: "2025-04-13T11:25:00Z",
      notes: [
        {
                id: "note-24",
                content: "Needs a call back next week."
              }
      ]
    },
  {
      id: "54",
      direction: "inbound",
      from: "+33 7 22 44 66 88",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 96,
      is_archived: false,
      created_at: "2025-04-13T11:35:00Z",
      notes: [
        {
                id: "note-25",
                content: "Agent left a voicemail about contract renewal."
              }
      ]
    },
  {
      id: "55",
      direction: "inbound",
      from: "+33 6 13 57 91 24",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 104,
      is_archived: false,
      created_at: "2025-04-12T08:50:00Z"
    },
  {
      id: "56",
      direction: "inbound",
      from: "+33 6 30 31 32 33",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: true,
      created_at: "2025-04-12T18:45:00Z"
    },
  {
      id: "57",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 40 50 60 70",
      call_type: "answered",
      duration: 588,
      is_archived: false,
      created_at: "2025-04-12T16:45:00Z"
    },
  {
      id: "58",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 77 12 45 90",
      call_type: "answered",
      duration: 235,
      is_archived: false,
      created_at: "2025-04-11T17:00:00Z"
    },
  {
      id: "59",
      direction: "inbound",
      from: "+33 6 19 29 39 49",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 76,
      is_archived: false,
      created_at: "2025-04-11T17:00:00Z",
      notes: [
        {
                id: "note-26",
                content: "Customer asked about account cancellation."
              }
      ]
    },
  {
      id: "60",
      direction: "inbound",
      from: "+33 7 01 02 03 04",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-11T09:40:00Z"
    },
  {
      id: "61",
      direction: "inbound",
      from: "+33 6 81 82 83 84",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-10T10:20:00Z"
    },
  {
      id: "62",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 90 80 70 60",
      call_type: "answered",
      duration: 778,
      is_archived: false,
      created_at: "2025-04-10T13:30:00Z"
    },
  {
      id: "63",
      direction: "inbound",
      from: "+33 7 33 44 55 66",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 705,
      is_archived: true,
      created_at: "2025-04-10T14:10:00Z"
    },
  {
      id: "64",
      direction: "inbound",
      from: "+33 6 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-09T17:45:00Z"
    },
  {
      id: "65",
      direction: "inbound",
      from: "+33 6 14 25 36 47",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 37,
      is_archived: true,
      created_at: "2025-04-09T17:05:00Z",
      notes: [
        {
                id: "note-27",
                content: "Customer wanted confirmation about delivery time."
              }
      ]
    },
  {
      id: "66",
      direction: "inbound",
      from: "+33 7 12 24 36 48",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 402,
      is_archived: false,
      created_at: "2025-04-09T17:30:00Z"
    },
  {
      id: "67",
      direction: "inbound",
      from: "+33 6 21 43 65 87",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 898,
      is_archived: false,
      created_at: "2025-04-08T09:50:00Z"
    },
  {
      id: "68",
      direction: "inbound",
      from: "+33 7 65 43 21 09",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 108,
      is_archived: false,
      created_at: "2025-04-08T10:45:00Z",
      notes: [
        {
                id: "note-28",
                content: "Customer left a message about a billing problem."
              },
        {
                id: "note-29",
                content: "Agent explained the new subscription options."
              }
      ]
    },
  {
      id: "69",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 80 70 60 50",
      call_type: "answered",
      duration: 724,
      is_archived: false,
      created_at: "2025-04-08T17:35:00Z"
    },
  {
      id: "70",
      direction: "inbound",
      from: "+33 7 15 26 37 48",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 120,
      is_archived: true,
      created_at: "2025-04-07T10:35:00Z",
      notes: [
        {
                id: "note-30",
                content: "Customer asked for a refund status update."
              }
      ]
    },
  {
      id: "71",
      direction: "inbound",
      from: "+33 6 91 82 73 64",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-07T13:30:00Z"
    },
  {
      id: "72",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 09 18 27 36",
      call_type: "voicemail",
      duration: 89,
      is_archived: false,
      created_at: "2025-04-07T11:25:00Z",
      notes: [
        {
                id: "note-31",
                content: "Customer confirmed appointment details."
              }
      ]
    },
  {
      id: "73",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 12 34 56 78",
      call_type: "voicemail",
      duration: 36,
      is_archived: false,
      created_at: "2025-04-06T12:25:00Z",
      notes: [
        {
                id: "note-32",
                content: "Customer asked to update their contact information."
              }
      ]
    },
  {
      id: "74",
      direction: "inbound",
      from: "+33 6 98 76 54 32",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 178,
      is_archived: false,
      created_at: "2025-04-06T14:35:00Z"
    },
  {
      id: "75",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 55 44 33 22",
      call_type: "answered",
      duration: 482,
      is_archived: false,
      created_at: "2025-04-06T10:45:00Z"
    },
  {
      id: "76",
      direction: "inbound",
      from: "+33 6 11 22 33 44",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 113,
      is_archived: false,
      created_at: "2025-04-05T16:05:00Z",
      notes: [
        {
                id: "note-33",
                content: "Agent left voicemail about pending verification."
              }
      ]
    },
  {
      id: "77",
      direction: "inbound",
      from: "+33 6 44 55 66 77",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 610,
      is_archived: true,
      created_at: "2025-04-05T16:15:00Z"
    },
  {
      id: "78",
      direction: "inbound",
      from: "+33 6 22 33 44 55",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 860,
      is_archived: true,
      created_at: "2025-04-05T18:20:00Z"
    },
  {
      id: "79",
      direction: "inbound",
      from: "+33 6 99 88 77 66",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 150,
      is_archived: false,
      created_at: "2025-04-04T13:05:00Z"
    },
  {
      id: "80",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 33 22 11 00",
      call_type: "answered",
      duration: 680,
      is_archived: false,
      created_at: "2025-04-04T16:30:00Z",
      notes: [
        {
                id: "note-34",
                content: "Customer issue escalated to technical support."
              }
      ]
    },
  {
      id: "81",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 10 20 30 40",
      call_type: "voicemail",
      duration: 47,
      is_archived: false,
      created_at: "2025-04-04T12:45:00Z",
      notes: [
        {
                id: "note-35",
                content: "Ticket number was shared with the customer."
              }
      ]
    },
  {
      id: "82",
      direction: "inbound",
      from: "+33 6 70 80 90 10",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 77,
      is_archived: false,
      created_at: "2025-04-03T15:25:00Z",
      notes: [
        {
                id: "note-36",
                content: "Customer requested a copy of the contract."
              }
      ]
    },
  {
      id: "83",
      direction: "inbound",
      from: "+33 6 45 67 89 01",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-03T12:45:00Z"
    },
  {
      id: "84",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 88 77 66 55",
      call_type: "answered",
      duration: 881,
      is_archived: true,
      created_at: "2025-04-03T11:20:00Z",
      notes: [
        {
                id: "note-37",
                content: "Customer asked about payment methods."
              }
      ]
    },
  {
      id: "85",
      direction: "inbound",
      from: "+33 6 18 28 38 48",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-04-02T15:30:00Z"
    },
  {
      id: "86",
      direction: "inbound",
      from: "+33 6 25 35 45 55",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 381,
      is_archived: false,
      created_at: "2025-04-02T14:40:00Z"
    },
  {
      id: "87",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 91 82 73 64",
      call_type: "answered",
      duration: 701,
      is_archived: false,
      created_at: "2025-04-02T10:15:00Z"
    },
  {
      id: "88",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 58 47 36 25",
      call_type: "voicemail",
      duration: 67,
      is_archived: false,
      created_at: "2025-04-01T18:40:00Z",
      notes: [
        {
                id: "note-38",
                content: "Customer reported a login issue."
              }
      ]
    },
  {
      id: "89",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 66 77 88 99",
      call_type: "answered",
      duration: 639,
      is_archived: false,
      created_at: "2025-04-01T14:45:00Z"
    },
  {
      id: "90",
      direction: "inbound",
      from: "+33 7 22 44 66 88",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 791,
      is_archived: false,
      created_at: "2025-04-01T13:15:00Z"
    },
  {
      id: "91",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 13 57 91 24",
      call_type: "answered",
      duration: 439,
      is_archived: true,
      created_at: "2025-03-31T09:30:00Z"
    },
  {
      id: "92",
      direction: "inbound",
      from: "+33 6 30 31 32 33",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-31T18:05:00Z"
    },
  {
      id: "93",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 40 50 60 70",
      call_type: "answered",
      duration: 781,
      is_archived: false,
      created_at: "2025-03-31T15:20:00Z"
    },
  {
      id: "94",
      direction: "inbound",
      from: "+33 6 77 12 45 90",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 67,
      is_archived: false,
      created_at: "2025-03-30T09:20:00Z",
      notes: [
        {
                id: "note-39",
                content: "Agent scheduled a follow-up call."
              }
      ]
    },
  {
      id: "95",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 19 29 39 49",
      call_type: "answered",
      duration: 352,
      is_archived: false,
      created_at: "2025-03-30T10:25:00Z"
    },
  {
      id: "96",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 01 02 03 04",
      call_type: "answered",
      duration: 758,
      is_archived: false,
      created_at: "2025-03-30T14:05:00Z",
      notes: [
        {
                id: "note-40",
                content: "Customer asked about changing their plan."
              }
      ]
    },
  {
      id: "97",
      direction: "inbound",
      from: "+33 6 81 82 83 84",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 433,
      is_archived: false,
      created_at: "2025-03-29T16:00:00Z"
    },
  {
      id: "98",
      direction: "inbound",
      from: "+33 6 90 80 70 60",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 898,
      is_archived: true,
      created_at: "2025-03-29T18:25:00Z"
    },
  {
      id: "99",
      direction: "inbound",
      from: "+33 7 33 44 55 66",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 638,
      is_archived: false,
      created_at: "2025-03-29T08:55:00Z"
    },
  {
      id: "100",
      direction: "inbound",
      from: "+33 6 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 736,
      is_archived: false,
      created_at: "2025-03-28T15:05:00Z",
      notes: [
        {
                id: "note-41",
                content: "Customer asked for a follow-up email."
              }
      ]
    },
  {
      id: "101",
      direction: "inbound",
      from: "+33 6 14 25 36 47",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 119,
      is_archived: false,
      created_at: "2025-03-28T15:55:00Z",
      notes: [
        {
                id: "note-42",
                content: "Customer requested information about pricing plans."
              }
      ]
    },
  {
      id: "102",
      direction: "inbound",
      from: "+33 7 12 24 36 48",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 693,
      is_archived: false,
      created_at: "2025-03-28T09:20:00Z"
    },
  {
      id: "103",
      direction: "inbound",
      from: "+33 6 21 43 65 87",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 55,
      is_archived: false,
      created_at: "2025-03-27T14:30:00Z",
      notes: [
        {
                id: "note-43",
                content: "Customer left a message about their invoice."
              }
      ]
    },
  {
      id: "104",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 65 43 21 09",
      call_type: "answered",
      duration: 92,
      is_archived: true,
      created_at: "2025-03-27T15:10:00Z",
      notes: [
        {
                id: "note-44",
                content: "Needs a call back next week."
              }
      ]
    },
  {
      id: "105",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 80 70 60 50",
      call_type: "missed",
      duration: 0,
      is_archived: true,
      created_at: "2025-03-27T11:15:00Z"
    },
  {
      id: "106",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 15 26 37 48",
      call_type: "answered",
      duration: 780,
      is_archived: false,
      created_at: "2025-03-26T12:10:00Z"
    },
  {
      id: "107",
      direction: "inbound",
      from: "+33 6 91 82 73 64",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 749,
      is_archived: false,
      created_at: "2025-03-26T18:40:00Z"
    },
  {
      id: "108",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 09 18 27 36",
      call_type: "answered",
      duration: 868,
      is_archived: false,
      created_at: "2025-03-26T10:10:00Z",
      notes: [
        {
                id: "note-45",
                content: "Agent left a voicemail about contract renewal."
              }
      ]
    },
  {
      id: "109",
      direction: "inbound",
      from: "+33 6 12 34 56 78",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 169,
      is_archived: false,
      created_at: "2025-03-25T11:35:00Z"
    },
  {
      id: "110",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 98 76 54 32",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-25T10:00:00Z",
      notes: [
        {
                id: "note-46",
                content: "Customer asked about account cancellation."
              }
      ]
    },
  {
      id: "111",
      direction: "inbound",
      from: "+33 7 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-25T11:00:00Z"
    },
  {
      id: "112",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 11 22 33 44",
      call_type: "voicemail",
      duration: 79,
      is_archived: true,
      created_at: "2025-03-24T10:10:00Z",
      notes: [
        {
                id: "note-47",
                content: "Customer wanted confirmation about delivery time."
              }
      ]
    },
  {
      id: "113",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 44 55 66 77",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-24T11:10:00Z"
    },
  {
      id: "114",
      direction: "inbound",
      from: "+33 6 22 33 44 55",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 697,
      is_archived: false,
      created_at: "2025-03-24T14:05:00Z"
    },
  {
      id: "115",
      direction: "inbound",
      from: "+33 6 99 88 77 66",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 495,
      is_archived: false,
      created_at: "2025-03-23T16:50:00Z"
    },
  {
      id: "116",
      direction: "inbound",
      from: "+33 6 33 22 11 00",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 372,
      is_archived: false,
      created_at: "2025-03-23T10:40:00Z",
      notes: [
        {
                id: "note-48",
                content: "Customer left a message about a billing problem."
              }
      ]
    },
  {
      id: "117",
      direction: "inbound",
      from: "+33 7 10 20 30 40",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 755,
      is_archived: true,
      created_at: "2025-03-23T15:50:00Z"
    },
  {
      id: "118",
      direction: "inbound",
      from: "+33 6 70 80 90 10",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 383,
      is_archived: false,
      created_at: "2025-03-22T10:10:00Z"
    },
  {
      id: "119",
      direction: "inbound",
      from: "+33 6 45 67 89 01",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 475,
      is_archived: true,
      created_at: "2025-03-22T12:00:00Z"
    },
  {
      id: "120",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 88 77 66 55",
      call_type: "answered",
      duration: 828,
      is_archived: false,
      created_at: "2025-03-22T09:15:00Z",
      notes: [
        {
                id: "note-49",
                content: "Agent explained the new subscription options."
              }
      ]
    },
  {
      id: "121",
      direction: "inbound",
      from: "+33 6 18 28 38 48",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 63,
      is_archived: false,
      created_at: "2025-03-21T12:15:00Z",
      notes: [
        {
                id: "note-50",
                content: "Customer asked for a refund status update."
              }
      ]
    },
  {
      id: "122",
      direction: "inbound",
      from: "+33 6 25 35 45 55",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-21T09:30:00Z"
    },
  {
      id: "123",
      direction: "inbound",
      from: "+33 7 91 82 73 64",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 542,
      is_archived: false,
      created_at: "2025-03-21T18:15:00Z"
    },
  {
      id: "124",
      direction: "inbound",
      from: "+33 6 58 47 36 25",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-20T11:50:00Z"
    },
  {
      id: "125",
      direction: "inbound",
      from: "+33 6 66 77 88 99",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 175,
      is_archived: false,
      created_at: "2025-03-20T09:05:00Z"
    },
  {
      id: "126",
      direction: "inbound",
      from: "+33 7 22 44 66 88",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 622,
      is_archived: true,
      created_at: "2025-03-20T18:40:00Z"
    },
  {
      id: "127",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 13 57 91 24",
      call_type: "answered",
      duration: 517,
      is_archived: false,
      created_at: "2025-03-19T16:45:00Z"
    },
  {
      id: "128",
      direction: "inbound",
      from: "+33 6 30 31 32 33",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 510,
      is_archived: false,
      created_at: "2025-03-19T13:20:00Z",
      notes: [
        {
                id: "note-51",
                content: "Customer confirmed appointment details."
              }
      ]
    },
  {
      id: "129",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 40 50 60 70",
      call_type: "answered",
      duration: 815,
      is_archived: false,
      created_at: "2025-03-19T12:25:00Z"
    },
  {
      id: "130",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 77 12 45 90",
      call_type: "answered",
      duration: 812,
      is_archived: true,
      created_at: "2025-03-18T10:45:00Z"
    },
  {
      id: "131",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 19 29 39 49",
      call_type: "answered",
      duration: 710,
      is_archived: false,
      created_at: "2025-03-18T16:55:00Z"
    },
  {
      id: "132",
      direction: "inbound",
      from: "+33 7 01 02 03 04",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 298,
      is_archived: false,
      created_at: "2025-03-18T15:45:00Z",
      notes: [
        {
                id: "note-52",
                content: "Customer asked to update their contact information."
              }
      ]
    },
  {
      id: "133",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 81 82 83 84",
      call_type: "answered",
      duration: 529,
      is_archived: true,
      created_at: "2025-03-17T17:00:00Z"
    },
  {
      id: "134",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 90 80 70 60",
      call_type: "answered",
      duration: 307,
      is_archived: false,
      created_at: "2025-03-17T13:35:00Z"
    },
  {
      id: "135",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 33 44 55 66",
      call_type: "voicemail",
      duration: 116,
      is_archived: false,
      created_at: "2025-03-17T17:35:00Z",
      notes: [
        {
                id: "note-53",
                content: "Agent left voicemail about pending verification."
              }
      ]
    },
  {
      id: "136",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 55 44 33 22",
      call_type: "answered",
      duration: 71,
      is_archived: false,
      created_at: "2025-03-16T14:00:00Z",
      notes: [
        {
                id: "note-54",
                content: "Customer issue escalated to technical support."
              },
        {
                id: "note-55",
                content: "Ticket number was shared with the customer."
              }
      ]
    },
  {
      id: "137",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 14 25 36 47",
      call_type: "voicemail",
      duration: 75,
      is_archived: false,
      created_at: "2025-03-16T15:40:00Z",
      notes: [
        {
                id: "note-56",
                content: "Customer requested a copy of the contract."
              }
      ]
    },
  {
      id: "138",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 12 24 36 48",
      call_type: "voicemail",
      duration: 56,
      is_archived: false,
      created_at: "2025-03-16T16:50:00Z",
      notes: [
        {
                id: "note-57",
                content: "Customer asked about payment methods."
              }
      ]
    },
  {
      id: "139",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 21 43 65 87",
      call_type: "voicemail",
      duration: 101,
      is_archived: false,
      created_at: "2025-03-15T17:00:00Z",
      notes: [
        {
                id: "note-58",
                content: "Customer reported a login issue."
              }
      ]
    },
  {
      id: "140",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 65 43 21 09",
      call_type: "answered",
      duration: 483,
      is_archived: true,
      created_at: "2025-03-15T13:40:00Z",
      notes: [
        {
                id: "note-59",
                content: "Agent scheduled a follow-up call."
              }
      ]
    },
  {
      id: "141",
      direction: "inbound",
      from: "+33 6 80 70 60 50",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 475,
      is_archived: false,
      created_at: "2025-03-15T11:40:00Z"
    },
  {
      id: "142",
      direction: "inbound",
      from: "+33 7 15 26 37 48",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 893,
      is_archived: false,
      created_at: "2025-03-14T10:50:00Z"
    },
  {
      id: "143",
      direction: "inbound",
      from: "+33 6 91 82 73 64",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 579,
      is_archived: true,
      created_at: "2025-03-14T14:00:00Z"
    },
  {
      id: "144",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 7 09 18 27 36",
      call_type: "answered",
      duration: 540,
      is_archived: false,
      created_at: "2025-03-14T11:15:00Z",
      notes: [
        {
                id: "note-60",
                content: "Customer asked about changing their plan."
              }
      ]
    },
  {
      id: "145",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 12 34 56 78",
      call_type: "missed",
      duration: 0,
      is_archived: false,
      created_at: "2025-03-13T13:30:00Z"
    },
  {
      id: "146",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 98 76 54 32",
      call_type: "answered",
      duration: 506,
      is_archived: false,
      created_at: "2025-03-13T15:10:00Z"
    },
  {
      id: "147",
      direction: "inbound",
      from: "+33 7 55 44 33 22",
      to: "+33 1 23 45 67 89",
      call_type: "missed",
      duration: 0,
      is_archived: true,
      created_at: "2025-03-13T13:45:00Z"
    },
  {
      id: "148",
      direction: "inbound",
      from: "+33 6 11 22 33 44",
      to: "+33 1 23 45 67 89",
      call_type: "answered",
      duration: 544,
      is_archived: false,
      created_at: "2025-03-12T15:20:00Z",
      notes: [
        {
                id: "note-61",
                content: "Customer asked for a follow-up email."
              }
      ]
    },
  {
      id: "149",
      direction: "outbound",
      from: "+33 1 23 45 67 89",
      to: "+33 6 44 55 66 77",
      call_type: "answered",
      duration: 655,
      is_archived: false,
      created_at: "2025-03-12T14:05:00Z"
    },
  {
      id: "150",
      direction: "inbound",
      from: "+33 6 22 33 44 55",
      to: "+33 1 23 45 67 89",
      call_type: "voicemail",
      duration: 35,
      is_archived: false,
      created_at: "2025-03-12T14:50:00Z",
      notes: [
        {
                id: "note-62",
                content: "Customer requested information about pricing plans."
              }
      ]
    }
];

export default calls;