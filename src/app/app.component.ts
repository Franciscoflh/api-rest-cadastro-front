import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, Validators, FormArray } from "@angular/forms";

interface Pessoa {
  nome: string;
  cpf: string;
  dataNascimento: string;
  contatos: Contato[];
}

interface Contato {
  nome: string;
  telefone: string;
  email: string;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Sistema de Cadastro de Pessoas</h1>
    <form (submit)="cadastrarPessoa()" [formGroup]="pessoaForm">
      <div>
        <label for="nome">Nome:</label>
        <input type="text" id="nome" formControlName="nome" class="form-field" required>
      </div>
      <div>
        <label for="cpf">CPF:</label>
        <input type="text" id="cpf" formControlName="cpf" required>
      </div>
      <div>
        <label for="dataNascimento">Data de Nascimento:</label>
        <input type="date" id="dataNascimento" formControlName="dataNascimento" required>
      </div>
      <div formArrayName="contatos">
        <div *ngFor="let contato of contatos.controls; let i = index" [formGroupName]="i">
          <div>
            <label for="nomeContato{{i}}">Nome:</label>
            <input type="text" [id]="'nomeContato' + i" formControlName="nome" required>
          </div>
          <div>
            <label for="telefoneContato{{i}}">Telefone:</label>
            <input type="text" [id]="'telefoneContato' + i" formControlName="telefone" required>
          </div>
          <div>
            <label for="emailContato{{i}}">Email:</label>
            <input type="email" [id]="'emailContato' + i" formControlName="email" required>
          </div>
          <div class="remove-button-container">
            <button type="button" class="remove-button" (click)="removerContato(i)">Remover Contato</button>
          </div>
        </div>
      </div>
      <div class="button-group">
        <button type="button" class="add-contact-btn" (click)="adicionarContato()">Adicionar Contato</button>
        <button type="submit">Cadastrar</button>
      </div>
    </form>

    <h2 class="registered-people-title">Pessoas Cadastradas:</h2>
    <ul class="registered-people">
      <li *ngFor="let pessoa of pessoas">
        <strong>Nome:</strong> {{ pessoa.nome }}<br>
        <strong>CPF:</strong> {{ pessoa.cpf }}<br>
        <strong>Data de Nascimento:</strong> {{ pessoa.dataNascimento | date }}<br>
        <strong>Contatos:</strong> <br>
        <ul>
          <li *ngFor="let contato of pessoa.contatos">
            <strong>Nome:</strong> {{ contato.nome }}<br>
            <strong>Telefone:</strong> {{ contato.telefone }}<br>
            <strong>Email:</strong> {{ contato.email }}<br>
          </li>
        </ul>
      </li>
    </ul>

  `,
  styleUrls: ['app.component.css']
})
export class AppComponent {
  pessoaForm: FormGroup;
  contatos: FormArray;
  pessoas: Pessoa[] = [];

  constructor(private http: HttpClient) {
    this.pessoaForm = new FormGroup({
      nome: new FormControl('', Validators.required),
      cpf: new FormControl('', Validators.required),
      dataNascimento: new FormControl('', Validators.required),
      contatos: new FormArray([])
    });

    this.contatos = this.pessoaForm.get('contatos') as FormArray;

    this.buscarPessoas();
  }

  buscarPessoas() {
    this.http.get<Pessoa[]>('http://localhost:8080/api/pessoas').subscribe((response) => {
      this.pessoas = response;
    });
  }

  cadastrarPessoa() {
    if (this.pessoaForm.valid) {
      const novaPessoa: Pessoa = {
        nome: this.pessoaForm.get('nome')?.value,
        cpf: this.pessoaForm.get('cpf')?.value,
        dataNascimento: this.pessoaForm.get('dataNascimento')?.value,
        contatos: this.pessoaForm.get('contatos')?.value
      };

      this.http.post('http://localhost:8080/api/pessoas', novaPessoa, {}).subscribe(
        (response) => {
          console.log('Pessoa cadastrada com sucesso:', response);
          this.pessoaForm.reset();
          this.contatos.clear();
          this.buscarPessoas();
        },
        (error) => {
          console.error('Erro ao cadastrar pessoa:', error);
        }
      );
    } else {
      console.error('Por favor, preencha todos os campos obrigatórios.');
    }
  }

  adicionarContato() {
    const novoContato = new FormGroup({
      nome: new FormControl('', Validators.required),
      telefone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });

    this.contatos.push(novoContato);
  }

  removerContato(index: number) {
    const contatos = this.pessoaForm.get('contatos') as FormArray;
    contatos.removeAt(index);
  }
}
