package com.example.myapplication;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;

import java.io.IOException;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.UnknownHostException;

public class MainActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Button btn = (Button) findViewById(R.id.button1);

        btn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                Thread thread = new Thread(new Runnable() {

                    @Override
                    public void run() {
                        try  {
                            //Your code goes here
                            try{
                                Socket sock = new Socket("192.168.99.103", 9100);
                                PrintWriter oStream = new PrintWriter(sock.getOutputStream());
                                oStream.println("POS365 kiem tra may in.");
                                oStream.close();
                                sock.close();

                            }catch (UnknownHostException e){
                                e.printStackTrace();
                            }catch (IOException e){
                                e.printStackTrace();
                            }
                            
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                    }
                });

                thread.start();



            }
        });

    }
}
