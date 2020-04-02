module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { netAmt : String
    , bonusPct : String
    , sickdaysAmt : String
    , benefitsPct : String
    , holidaysAmt : String
    , nonBillablePct : String
    }


init : Model
init =
    { netAmt = "0"
    , bonusPct = "0.01"
    , sickdaysAmt = "7"
    , benefitsPct = "0.2"
    , holidaysAmt = "10"
    , nonBillablePct = "0.2"
    }



-- UPDATE


type Msg
    = Net String
    | Bonus String
    | Sickdays String
    | Benefits String
    | Holidays String
    | Nonbillable String


update : Msg -> Model -> Model
update msg model =
    case msg of
        Net netAmt ->
            { model | netAmt = netAmt }

        Bonus bonusPct ->
            { model | bonusPct = bonusPct }

        Sickdays sickdaysAmt ->
            { model | sickdaysAmt = sickdaysAmt }

        Benefits benefitsPct ->
            { model | benefitsPct = benefitsPct }

        Holidays holidaysAmt ->
            { model | holidaysAmt = holidaysAmt }

        Nonbillable nonBillablePct ->
            { model | nonBillablePct = nonBillablePct }



-- VIEW


view : Model -> Html Msg
view model =
    div []
        [ viewInput "net" "text" "Net" model.netAmt Net
        , viewInput "bonus" "text" "Bonus" model.bonusPct Bonus
        , viewInput "sickdays" "text" "Sickdays" model.sickdaysAmt Sickdays
        , viewInput "benefits" "text" "Benefits" model.benefitsPct Benefits
        , viewInput "holidays" "text" "Holidays" model.holidaysAmt Holidays
        , viewInput "non billable time" "text" "nonBillablePct" model.nonBillablePct Nonbillable
        ]


viewInput : String -> String -> String -> String -> (String -> msg) -> Html msg
viewInput l t p v toMsg =
    label [ for l ]
        [ text l
        , input [ id l, type_ t, placeholder p, value v, onInput toMsg ] []
        ]
