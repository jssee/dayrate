module Main exposing (main)

import Basics exposing (..)
import Browser
import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)



-- MAIN


main =
    Browser.sandbox { init = init, update = update, view = view }



-- MODEL


type alias Model =
    { netAmt : Int
    , grossAmt : Int
    , bonusPct : Float
    , sickdaysAmt : Int
    , benefitsPct : Float
    , holidaysAmt : Int
    , nonBillablePct : Float
    }


init : Model
init =
    { netAmt = 0
    , grossAmt = 0
    , bonusPct = 0.01
    , sickdaysAmt = 7
    , benefitsPct = 0.2
    , holidaysAmt = 10
    , nonBillablePct = 0.2
    }



-- UPDATE


type Msg
    = Net Int
    | Gross Int
    | Bonus Float
    | Sickdays Int
    | Benefits Float
    | Holidays Int
    | Nonbillable Float


update : Msg -> Model -> Model
update msg model =
    case msg of
        Net netAmt ->
            { model | netAmt = netAmt }

        Gross grossAmt ->
            { model | grossAmt = grossAmt }

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




salaryFormula g bs bn =
  ( g * bs ) + ( g * bn ) + g



-- VIEW


view : Model -> Html Msg
view model =
    div
        []
        [ div [] [ text ( String.fromInt model.grossAmt ) ]
        , vInput "net" ( String.fromInt model.netAmt ) Net
        ]

vInput : String -> String -> ( String -> msg ) -> Html msg
vInput l v toMsg =
    label [ for l ]
        [ text l
        , input [ type_ "text", id l, value v, onInput toMsg ] []
        ]
