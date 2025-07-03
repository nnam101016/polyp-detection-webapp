import streamlit as st

st.title("Result")



# Display results in Streamlit using HTML
st.write("**Prediction Results:**", unsafe_allow_html=True)
st.write(st.session_state["table_data"], unsafe_allow_html=True)